import { COLUMN_DATA_TYPES, TinyintColumn } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateTinyintColumn = (node: ColumnDefinitionNode): TinyintColumn => {
  const base = generateColumnBase(node);
  return base(COLUMN_DATA_TYPES.TINYINT);
};
