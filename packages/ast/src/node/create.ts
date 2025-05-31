import { Node, NODE_TYPES } from './base';

/**
 * MySQL CREATE node types.
 */
export const CREATE_NODE_KEYWORDS = {
  TABLE: 'table',
  INDEX: 'index',
  DATABASE: 'database',
  USER: 'user',
} as const;

export type CreateNodeKeyword =
  (typeof CREATE_NODE_KEYWORDS)[keyof typeof CREATE_NODE_KEYWORDS];

export interface CreateTableNode extends Node<typeof NODE_TYPES.CREATE> {
  keyword: typeof CREATE_NODE_KEYWORDS.TABLE;
  temporary: boolean;
  db: string;
  name: string;
  if_not_exists: boolean;
  like: CreateLikeNode | null;
  as: string | null;
}

interface CreateLikeNode extends Node<typeof NODE_TYPES.CREATE> {
  table: string;
  parentheses: boolean;
}
