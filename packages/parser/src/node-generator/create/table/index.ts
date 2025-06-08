import {
  CREATE_NODE_KEYWORDS,
  NODE_TYPES,
  type CreateTableDefinition,
  type CreateTableNode,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../../common/types/unwrap-array';

import { generateColumnDefinition } from './column';
import { generateConstraintDefinition } from './constraint';

export const generateCreateTableNode = (node: nodeSqlParser.Create): CreateTableNode => {
  const createTableDefinitions: CreateTableDefinition[] =
    node.create_definitions?.reduce<CreateTableDefinition[]>((acc, def) => {
      const definition = generateCreateTableDefinition(def);
      if (definition) return [...acc, definition];
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

const generateCreateTableDefinition = (
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): CreateTableDefinition | null => {
  switch (node.resource) {
    case 'column': {
      return generateColumnDefinition(node);
    }
    case 'constraint': {
      return generateConstraintDefinition(node);
    }
    default:
      return null;
  }
};
