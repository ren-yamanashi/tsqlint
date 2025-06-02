import {
  COLUMN_DATA_TYPES,
  EnumColumn,
  ExpressionListNode,
  NODE_TYPES,
  VALUE_TYPES,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateEnumColumn = (node: ColumnDefinitionNode): EnumColumn => {
  const base = generateColumnBase(node);
  return {
    ...base(NODE_TYPES.ENUM_COLUMN, COLUMN_DATA_TYPES.ENUM),
    expression_list: getExpressionList(node.definition),
  };
};

const getExpressionList = (definition: ColumnDefinitionNode['definition']): ExpressionListNode => {
  return {
    node_type: NODE_TYPES.EXPRESSION_LIST,
    parentheses: !!definition.dataType,
    value: getDefinitionValue(definition),
  };
};

const getDefinitionValue = (
  definition: ColumnDefinitionNode['definition'],
): ExpressionListNode['value'] => {
  if (definition.dataType !== 'ENUM') return [];
  if (!isExpr(definition)) return [];
  return definition.expr.value.map(expr => {
    const type =
      // NOTE: `expr.type` は実際には `number` になることがあるため、`@ts-ignore` を使用
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expr.type === 'number'
        ? VALUE_TYPES.NUMBER
        : expr.type === 'double_quote_string'
          ? VALUE_TYPES.DOUBLE_QUOTE_STRING
          : VALUE_TYPES.SINGLE_QUOTE_STRING;

    // NOTE: `type` で無理やり条件に一致しない場合を `VALUE_TYPES.SINGLE_QUOTE_STRING` に丸め込んでいる
    //       そのため、`type` が `VALUE_TYPES.SINGLE_QUOTE_STRING` の場合かつ、`expr.value` が文字列でない場合は文字列に変換
    const value =
      type === VALUE_TYPES.SINGLE_QUOTE_STRING && typeof expr.value !== 'string'
        ? String(expr.value)
        : expr.value;

    return { type, value };
  });
};

const isExpr = (value: unknown): value is { expr: { value: nodeSqlParser.ValueExpr[] } } => {
  return (
    typeof value === 'object' &&
    value != null &&
    'expr' in value &&
    typeof value.expr === 'object' &&
    value.expr != null &&
    'value' in value.expr &&
    Array.isArray(value.expr.value) &&
    value.expr.value.every(isValueExpr)
  );
};

const isValueExpr = (value: unknown): value is nodeSqlParser.ValueExpr => {
  return (
    typeof value === 'object' &&
    value != null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'value' in value &&
    typeof value.value === 'string'
  );
};
