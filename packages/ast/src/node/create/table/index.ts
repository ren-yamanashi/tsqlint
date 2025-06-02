import { NODE_TYPES } from '../../shared/node-type';

import { CreateTableDefinition } from './create-definition';

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

export interface CreateTableNode {
  node_type: typeof NODE_TYPES.CREATE;
  keyword: typeof CREATE_NODE_KEYWORDS.TABLE;
  db: string;
  table_name: string;
  temporary: boolean;
  if_not_exists: boolean;
  definitions: CreateTableDefinition[];
}

export * from './column';
export * from './constraint';
export * from './create-definition';
