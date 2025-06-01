import { DATA_TYPES, Tinyint } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateTinyintColumn = (node: ColumnDefinitionNode): Tinyint => {
  const base = generateColumnBase(node);
  return base(DATA_TYPES.TINYINT);
};
