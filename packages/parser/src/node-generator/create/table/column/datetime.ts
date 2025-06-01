import { DATA_TYPES, Datetime } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateDatetimeColumn = (
  node: ColumnDefinitionNode,
): Datetime => {
  const base = generateColumnBase(node);
  return base(DATA_TYPES.DATETIME);
};
