import {
  ColumnBase,
  ColumnDataType,
  ColumnRef,
  Comment,
  DefaultVal,
  NODE_TYPES,
  VALUE_TYPES,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { getColumnName } from '../../../../common/get-column-name';

import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateColumnBase =
  (node: ColumnDefinitionNode) =>
  <T extends ColumnDataType>(dataType: T): Omit<ColumnBase, 'data_type'> & { data_type: T } => {
    const columnRef: ColumnRef = {
      node_type: 'column_ref',
      column_name: getColumnName(node.column),
    };
    return {
      node_type: NODE_TYPES.COLUMN,
      column_ref: columnRef,
      data_type: dataType,
      comment: generateCommentNode(node),
      default_val: generateDefaultValueNode(node),
      nullable: !!node.nullable,
    };
  };

const generateCommentNode = (node: ColumnDefinitionNode): Comment | null => {
  // NOTE: nodeSqlParser の型定義では `node.comment` は string 型だが、実際には ValueExpr 型であるため、`as unknown as ValueExpr` を使用
  const comment = node.comment ? (node.comment.value as unknown as nodeSqlParser.ValueExpr) : null;

  if (!comment) return null;

  return {
    node_type: NODE_TYPES.COMMENT,
    value: {
      type:
        comment.type === 'single_quote_string'
          ? VALUE_TYPES.SINGLE_QUOTE_STRING
          : VALUE_TYPES.DOUBLE_QUOTE_STRING,
      value: String(comment.value),
    },
  };
};

const generateDefaultValueNode = (node: ColumnDefinitionNode): DefaultVal | null => {
  const defaultVal = node.default_val ? (node.default_val.value as nodeSqlParser.ValueExpr) : null;

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
    type === VALUE_TYPES.SINGLE_QUOTE_STRING && typeof defaultVal.value !== 'string'
      ? String(defaultVal.value)
      : defaultVal.value;

  return {
    node_type: NODE_TYPES.DEFAULT_VAL,
    value: { type, value },
  };
};
