import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

export interface BigintColumn extends ColumnBase<typeof COLUMN_DATA_TYPES.BIGINT> {
  unsigned: boolean;
  auto_increment: boolean;
}
