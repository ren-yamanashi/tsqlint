export const VALUE_TYPES = {
  SINGLE_QUOTE_STRING: 'single_quote_string',
  DOUBLE_QUOTE_STRING: 'double_quote_string',
  NUMBER: 'number',
} as const;

export type ValueType = (typeof VALUE_TYPES)[keyof typeof VALUE_TYPES];
