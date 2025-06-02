import {
  CREATE_NODE_KEYWORDS,
  NODE_TYPES,
  type CreateTableDefinition,
  type CreateTableNode,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { generateColumnDefinition } from './column';

export const generateCreateTableNode = (node: nodeSqlParser.Create): CreateTableNode => {
  const createTableDefinitions: CreateTableDefinition[] =
    node.create_definitions?.reduce<CreateTableDefinition[]>((acc, def) => {
      const columnDefinition = generateColumnDefinition(def);
      if (columnDefinition) return [...acc, columnDefinition];
      return acc;
    }, []) ?? [];
  return {
    node_type: NODE_TYPES.CREATE,
    keyword: CREATE_NODE_KEYWORDS.TABLE,
    db: node.table?.[0].db ?? '',
    table_name: node.table?.[0].table ?? '',
    temporary: !!node.temporary,
    if_not_exists: !!node.if_not_exists,
    definitions: createTableDefinitions,
  };
};
