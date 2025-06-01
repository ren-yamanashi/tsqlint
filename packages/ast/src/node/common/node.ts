export const NODE_TYPES = {
  CREATE: 'create',
  COMMENT: 'comment',
  DEFAULT_VAL: 'default_val',
  EXPRESSION_LIST: 'expression_list',
  COLUMN_REF: 'column_ref',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export interface Node<T extends NodeType> {
  type: T;
}
