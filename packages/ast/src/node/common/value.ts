import { Node, NODE_TYPES } from './node';

export const VALUE_TYPES = {
  SINGLE_QUOTE_STRING: 'single_quote_string',
  DOUBLE_QUOTE_STRING: 'double_quote_string',
  NUMBER: 'number',
} as const;

export type ValueType = (typeof VALUE_TYPES)[keyof typeof VALUE_TYPES];

export interface CommentNode extends Node<typeof NODE_TYPES.COMMENT> {
  value: {
    type:
      | typeof VALUE_TYPES.SINGLE_QUOTE_STRING
      | typeof VALUE_TYPES.DOUBLE_QUOTE_STRING;
    value: string;
  };
}

export interface DefaultValueNode extends Node<typeof NODE_TYPES.DEFAULT_VAL> {
  value: {
    type: ValueType;
    value: string | number | boolean | null;
  };
}

// NOTE: enum などで使用
export interface ExpressionListNode
  extends Node<typeof NODE_TYPES.EXPRESSION_LIST> {
  value: {
    type: ValueType;
    value: string;
  }[];
  parentheses: boolean;
}
