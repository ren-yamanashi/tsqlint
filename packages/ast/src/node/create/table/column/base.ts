import { NODE_TYPES } from '../../../__constants__/node-type';
import { ColumnRef } from '../../../shared/column-ref';
import { Comment } from '../../../shared/comment';
import { DefaultVal } from '../../../shared/default-val';

import { ColumnDataType } from './__constants__/data-type';

export interface ColumnBase {
  node_type: typeof NODE_TYPES.COLUMN;
  column_ref: ColumnRef;
  data_type: ColumnDataType;
  comment: Comment | null;
  default_val: DefaultVal | null;
  nullable: boolean;
}
