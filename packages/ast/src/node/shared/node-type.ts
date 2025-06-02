export const NODE_TYPES = {
  CREATE: 'create',
  COMMENT: 'comment',
  DEFAULT_VAL: 'default_val',
  EXPRESSION_LIST: 'expression_list',
  COLUMN_REF: 'column_ref',
  COLUMN: 'column',
  COLUMN_DEFINITION: 'column_definition',
  CONSTRAINT: 'constraint',
  CONSTRAINT_DEFINITION: 'constraint_definition',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];
