import { NODE_TYPES } from '../../../shared/node-type';

import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

export interface VarcharColumn
  extends ColumnBase<typeof NODE_TYPES.VARCHAR_COLUMN, typeof COLUMN_DATA_TYPES.VARCHAR> {
  length: number | null;
  parentheses: boolean;
}
