import { DATA_TYPES, Varchar } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateVarcharColumn = (node: ColumnDefinitionNode): Varchar => {
  const base = generateColumnBase(node);
  return {
    ...base(DATA_TYPES.VARCHAR),
    length: node.definition.length ?? null,
    parentheses: !!node.definition.parentheses,
  };
};
