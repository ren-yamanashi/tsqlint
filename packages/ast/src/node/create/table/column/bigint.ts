import { NODE_TYPES } from '../../../shared/node-type';

import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

export interface BigintColumn
  extends ColumnBase<typeof NODE_TYPES.BIGINT_COLUMN, typeof COLUMN_DATA_TYPES.BIGINT> {
  unsigned: boolean;
  auto_increment: boolean;
}
