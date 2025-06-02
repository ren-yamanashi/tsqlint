import { COLUMN_DATA_TYPES, DatetimeColumn, NODE_TYPES } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateDatetimeColumn = (node: ColumnDefinitionNode): DatetimeColumn => {
  const base = generateColumnBase(node);
  return base(NODE_TYPES.DATETIME_COLUMN, COLUMN_DATA_TYPES.DATETIME);
};
