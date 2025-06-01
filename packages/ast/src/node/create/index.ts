import { Node, NODE_TYPES } from '../common/node';

import { CreateDefinition } from './column-definition';

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
  db: string;
  table_name: string;
  temporary: boolean;
  if_not_exists: boolean;
  definitions: CreateDefinition[];
}
