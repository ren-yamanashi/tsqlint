export const NODE_TYPES = {
  CREATE: 'create',
  COMMENT: 'comment',
  DEFAULT_VAL: 'default_val',
  EXPRESSION_LIST: 'expression_list',
  COLUMN_REF: 'column_ref',
  // column
  BIGINT_COLUMN: 'bigint_column',
  DATETIME_COLUMN: 'datetime_column',
  ENUM_COLUMN: 'enum_column',
  TINYINT_COLUMN: 'tinyint_column',
  VARCHAR_COLUMN: 'varchar_column',
  COLUMN_DEFINITION: 'column_definition',

  // constraint
  PRIMARY_CONSTRAINT: 'primary_constraint',
  CONSTRAINT_DEFINITION: 'constraint_definition',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];
