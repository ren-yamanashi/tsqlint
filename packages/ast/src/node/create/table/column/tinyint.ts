import { NODE_TYPES } from '../../../shared/node-type';

import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TinyintColumn
  extends ColumnBase<typeof NODE_TYPES.TINYINT_COLUMN, typeof COLUMN_DATA_TYPES.TINYINT> {}
