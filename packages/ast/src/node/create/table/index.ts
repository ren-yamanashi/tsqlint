import { NODE_TYPES } from '../../__constants__/node-type';

import { CREATE_NODE_KEYWORDS } from './__constants__/create-node-keyword';
import { CreateTableDefinition } from './create-definition';

export type CreateTableNode = {
  node_type: typeof NODE_TYPES.CREATE;
  keyword: typeof CREATE_NODE_KEYWORDS.TABLE;
  db: string;
  table_name: string;
  temporary: boolean;
  if_not_exists: boolean;
  definitions: CreateTableDefinition[];
};

export * from './__constants__/create-node-keyword';
export * from './column';
export * from './constraint';
export * from './create-definition';
