import { COLUMN_DATA_TYPES, DatetimeColumn } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateDatetimeColumn = (node: ColumnDefinitionNode): DatetimeColumn => {
  const base = generateColumnBase(node);
  return base(COLUMN_DATA_TYPES.DATETIME);
};
