/**
 * MySQL CREATE node types.
 */
export const CREATE_NODE_KEYWORDS = {
  TABLE: 'table',
  INDEX: 'index',
  DATABASE: 'database',
  USER: 'user',
} as const;

export type CreateNodeKeyword = (typeof CREATE_NODE_KEYWORDS)[keyof typeof CREATE_NODE_KEYWORDS];
