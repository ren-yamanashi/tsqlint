import { ColumnRef } from '../../../../shared/column-ref';
import { Comment } from '../../../../shared/comment';
import { DefaultVal } from '../../../../shared/default-val';
import { NODE_TYPES } from '../../../../shared/node-type';

import { ColumnDataType } from './data-type';

export interface ColumnBase<T extends ColumnDataType> {
  node_type: typeof NODE_TYPES.COLUMN;
  column_ref: ColumnRef;
  data_type: T;
  comment: Comment | null;
  default_val: DefaultVal | null;
  nullable: boolean;
}
