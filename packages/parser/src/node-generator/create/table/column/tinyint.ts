import { COLUMN_DATA_TYPES, NODE_TYPES, TinyintColumn } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateTinyintColumn = (node: ColumnDefinitionNode): TinyintColumn => {
  const base = generateColumnBase(node);
  return base(NODE_TYPES.TINYINT_COLUMN, COLUMN_DATA_TYPES.TINYINT);
};
