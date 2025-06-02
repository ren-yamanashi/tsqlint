import { COLUMN_DATA_TYPES, VarcharColumn } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateVarcharColumn = (node: ColumnDefinitionNode): VarcharColumn => {
  const base = generateColumnBase(node);
  return {
    ...base(COLUMN_DATA_TYPES.VARCHAR),
    length: node.definition.length ?? null,
    parentheses: !!node.definition.parentheses,
  };
};
