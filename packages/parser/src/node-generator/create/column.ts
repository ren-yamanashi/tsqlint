/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Bigint,
  ColumnRef,
  CommentNode,
  DATA_TYPES,
  Datetime,
  Enum,
  NODE_TYPES,
  Tinyint,
  VALUE_TYPES,
  Varchar,
  type CreateColumnDefinition,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../types/unwrap-array';

export const createColumnDefinition = (
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): CreateColumnDefinition | null => {
  switch (node.resource) {
    case 'column': {
      const definition = node.definition;
      const dataType = definition.dataType.toLowerCase();

      const columnName =
        node.column.type === 'column_ref' ? node.column.column : null;

      const comment = node.comment
        ? (node.comment.value as unknown as nodeSqlParser.ValueExpr)
        : null;

      const defaultVal = node.default_val
        ? (node.default_val.value as nodeSqlParser.ValueExpr)
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
                // TODO: より厳密に
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                defaultVal.type === 'number'
                  ? VALUE_TYPES.NUMBER
                  : defaultVal.type === 'double_quote_string'
                    ? VALUE_TYPES.DOUBLE_QUOTE_STRING
                    : VALUE_TYPES.SINGLE_QUOTE_STRING,
              value: defaultVal.value,
            },
          }
        : null;

      switch (dataType) {
        case DATA_TYPES.DATETIME: {
          const datetimeColumn: Datetime = {
            column_ref: columnRef,
            data_type: DATA_TYPES.DATETIME,
            comment: commentNode,
            default_val: defaultValueNode,
            nullable: !node.nullable,
          };
          return {
            type: 'column_definition',
            column: datetimeColumn,
          };
        }
        case DATA_TYPES.TINYINT: {
          const tinyintColumn: Tinyint = {
            column_ref: columnRef,
            data_type: DATA_TYPES.TINYINT,
            comment: commentNode,
            default_val: defaultValueNode,
            nullable: !node.nullable,
          };
          return {
            type: 'column_definition',
            column: tinyintColumn,
          };
        }
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
        case DATA_TYPES.VARCHAR: {
          const varcharColumn: Varchar = {
            column_ref: columnRef,
            data_type: DATA_TYPES.VARCHAR,
            comment: commentNode,
            default_val: defaultValueNode,
            nullable: !node.nullable,
            length: definition.length ?? null,
            parentheses: !!definition.parentheses,
          };
          return {
            type: 'column_definition',
            column: varcharColumn,
          };
        }
        case DATA_TYPES.ENUM: {
          const enumColumn: Enum = {
            column_ref: columnRef,
            data_type: DATA_TYPES.ENUM,
            comment: commentNode,
            default_val: defaultValueNode,
            nullable: !node.nullable,
            expression_list: {
              type: NODE_TYPES.EXPRESSION_LIST,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value:
                definition.dataType === 'ENUM'
                  ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    (definition as unknown as any).expr.value.map(
                      (val: nodeSqlParser.ValueExpr) => {
                        const valueType =
                          // TODO: より厳密に
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
                          val.type === 'number'
                            ? VALUE_TYPES.NUMBER
                            : val.type === 'double_quote_string'
                              ? VALUE_TYPES.DOUBLE_QUOTE_STRING
                              : VALUE_TYPES.SINGLE_QUOTE_STRING;
                        return { type: valueType, value: val.value };
                      },
                    )
                  : [],
              parentheses: !!definition.parentheses,
            },
          };
          return {
            type: 'column_definition',
            column: enumColumn,
          };
        }
        default:
          return null;
      }
    }
    default:
      return null;
  }
};
