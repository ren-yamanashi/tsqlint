import * as fs from 'node:fs';

import {
  Bigint,
  ColumnRef,
  CommentNode,
  DATA_TYPES,
  NODE_TYPES,
  VALUE_TYPES,
  type CreateColumnDefinition,
  type CreateDefinition,
  type CreateTableNode,
} from '@tsqlint/ast';
import nodeSqlParser, { ValueExpr } from 'node-sql-parser';

// eslint-disable-next-line @typescript-eslint/array-type
type UnwrapArray<T> = T extends Array<infer A> | ReadonlyArray<infer A>
  ? A
  : never;

const parser = new nodeSqlParser.Parser();
const sqlFile = fs.readFileSync('sample.sql', 'utf-8');

const replacedSql = sqlFile.replace(/BINARY/g, '');
const ast = parser.astify(replacedSql, { database: 'mysql' });

const newAst = (Array.isArray(ast) ? ast : [ast]).reduce<CreateTableNode[]>(
  (acc, node) => {
    switch (node.type) {
      case 'create': {
        if (node.keyword !== 'table') return acc;
        const createDefinitions: CreateDefinition[] =
          node.create_definitions?.reduce<CreateDefinition[]>((acc, def) => {
            const columnDefinition = createColumnDefinition(def);
            if (columnDefinition) {
              return [...acc, columnDefinition];
            }
            return acc;
          }, []) ?? [];
        const createTableNode: CreateTableNode = {
          type: 'create',
          keyword: 'table',
          db: node.table?.[0].db ?? '',
          table_name: node.table?.[0].table ?? '',
          temporary: !!node.temporary,
          if_not_exists: !!node.if_not_exists,
          definitions: createDefinitions,
        };
        return [...acc, createTableNode];
      }
      default:
        return acc;
    }
  },
  [],
);

fs.writeFileSync('ast.json', JSON.stringify(newAst));

function createColumnDefinition(
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): CreateColumnDefinition | null {
  switch (node.resource) {
    case 'column': {
      const definition = node.definition;
      const dataType = definition.dataType.toLowerCase();

      const columnName =
        node.column.type === 'column_ref' ? node.column.column : null;

      const comment = node.comment
        ? (node.comment.value as unknown as ValueExpr)
        : null;

      const defaultVal = node.default_val
        ? (node.default_val.value as ValueExpr)
        : null;

      if (!columnName) {
        throw new Error('Column name is required for BIGINT type');
      }

      const columnRef: ColumnRef = {
        type: 'column_ref',
        column_name:
          typeof columnName === 'string'
            ? columnName
            : String(columnName.expr.value),
      };

      const commentNode: CommentNode | null = comment
        ? {
            type: NODE_TYPES.COMMENT,
            value: {
              type:
                comment.type === 'single_quote_string'
                  ? VALUE_TYPES.SINGLE_QUOTE_STRING
                  : VALUE_TYPES.DOUBLE_QUOTE_STRING,
              value: String(comment.value),
            },
          }
        : null;

      const defaultValueNode = defaultVal
        ? {
            type: NODE_TYPES.DEFAULT_VAL,
            value: {
              type:
                defaultVal.value === 'number'
                  ? VALUE_TYPES.NUMBER
                  : defaultVal.type === 'double_quote_string'
                    ? VALUE_TYPES.DOUBLE_QUOTE_STRING
                    : VALUE_TYPES.SINGLE_QUOTE_STRING,
              value: defaultVal.value,
            },
          }
        : null;

      switch (dataType) {
        case DATA_TYPES.BIGINT: {
          const bigintColumn: Bigint = {
            column_ref: columnRef,
            data_type: DATA_TYPES.BIGINT,
            comment: commentNode,
            default_val: defaultValueNode,
            nullable: !node.nullable,
            unsigned: Array.isArray(definition.suffix)
              ? definition.suffix[0] === 'UNSIGNED'
              : false,
            auto_increment: !!node.auto_increment,
          };
          return {
            type: 'column_definition',
            column: bigintColumn,
          };
        }

        default:
          return null;
      }
    }
    default:
      return null;
  }
}
