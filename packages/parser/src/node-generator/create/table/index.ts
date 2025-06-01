import {
  CREATE_NODE_KEYWORDS,
  NODE_TYPES,
  type CreateDefinition,
  type CreateTableNode,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { createColumnDefinition } from './column';

export const generateCreateTableNode = (node: nodeSqlParser.Create): CreateTableNode => {
  const createDefinitions: CreateDefinition[] =
    node.create_definitions?.reduce<CreateDefinition[]>((acc, def) => {
      const columnDefinition = createColumnDefinition(def);
      if (columnDefinition) return [...acc, columnDefinition];
      return acc;
    }, []) ?? [];
  return {
    type: NODE_TYPES.CREATE,
    keyword: CREATE_NODE_KEYWORDS.TABLE,
    db: node.table?.[0].db ?? '',
    table_name: node.table?.[0].table ?? '',
    temporary: !!node.temporary,
    if_not_exists: !!node.if_not_exists,
    definitions: createDefinitions,
  };
};
