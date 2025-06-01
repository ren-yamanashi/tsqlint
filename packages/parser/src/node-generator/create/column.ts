/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Bigint,
  ColumnRef,
  CommentNode,
  DATA_TYPES,
  Datetime,
  DefaultValueNode,
  Enum,
  NODE_TYPES,
  Tinyint,
  VALUE_TYPES,
  Varchar,
  type CreateColumnDefinition,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../types/unwrap-array';

type ExtractColumnDefinition<T> = T extends { resource: 'column' } ? T : never;

type ColumnDefinitionNode = ExtractColumnDefinition<
  UnwrapArray<NonNullable<nodeSqlParser.Create['create_definitions']>>
>;

export const createColumnDefinition = (
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): CreateColumnDefinition | null => {
  switch (node.resource) {
    case 'column': {
      const definition = node.definition;
      const dataType = definition.dataType.toLowerCase();
      const commentNode = generateCommentNode(node);
      const defaultValueNode = generateDefaultValueNode(node);
      const columnRef: ColumnRef = {
        type: 'column_ref',
        column_name: getColumnName(node.column),
      };

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

const getColumnName = (column: nodeSqlParser.ColumnRef): string => {
  const columnName = column.type === 'column_ref' ? column.column : null;
  if (!columnName) return '';
  if (typeof columnName === 'string') return columnName;
  return String(columnName.expr.value);
};

const generateCommentNode = (
  node: ColumnDefinitionNode,
): CommentNode | null => {
  // NOTE: nodeSqlParser の型定義では `node.comment` は string 型だが、実際には ValueExpr 型であるため、`as unknown as ValueExpr` を使用
  const comment = node.comment
    ? (node.comment.value as unknown as nodeSqlParser.ValueExpr)
    : null;

  if (!comment) return null;

  return {
    type: NODE_TYPES.COMMENT,
    value: {
      type:
        comment.type === 'single_quote_string'
          ? VALUE_TYPES.SINGLE_QUOTE_STRING
          : VALUE_TYPES.DOUBLE_QUOTE_STRING,
      value: String(comment.value),
    },
  };
};

const generateDefaultValueNode = (
  node: ColumnDefinitionNode,
): DefaultValueNode | null => {
  const defaultVal = node.default_val
    ? (node.default_val.value as nodeSqlParser.ValueExpr)
    : null;

  if (!defaultVal) return null;

  const type =
    // NOTE: `defaultVal.type` は実際には `number` になることがあるため、`@ts-ignore` を使用
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    defaultVal.type === 'number'
      ? VALUE_TYPES.NUMBER
      : defaultVal.type === 'double_quote_string'
        ? VALUE_TYPES.DOUBLE_QUOTE_STRING
        : VALUE_TYPES.SINGLE_QUOTE_STRING;

  // NOTE: `type` で無理やり条件に一致しない場合を `VALUE_TYPES.SINGLE_QUOTE_STRING` に丸め込んでいる
  //       そのため、`type` が `VALUE_TYPES.SINGLE_QUOTE_STRING` の場合かつ、`defaultVal.value` が文字列でない場合は文字列に変換
  const value =
    type === VALUE_TYPES.SINGLE_QUOTE_STRING &&
    typeof defaultVal.value !== 'string'
      ? String(defaultVal.value)
      : defaultVal.value;

  return {
    type: NODE_TYPES.DEFAULT_VAL,
    value: { type, value },
  };
};
