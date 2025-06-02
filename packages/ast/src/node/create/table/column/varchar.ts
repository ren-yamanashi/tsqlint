import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

export interface VarcharColumn extends ColumnBase<typeof COLUMN_DATA_TYPES.VARCHAR> {
  length: number | null;
  parentheses: boolean;
}
