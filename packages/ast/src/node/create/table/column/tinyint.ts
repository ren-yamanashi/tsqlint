import { NODE_TYPES } from '../../../__constants__/node-type';
import { ColumnRef } from '../../../shared/column-ref';
import { Comment } from '../../../shared/comment';
import { DefaultVal } from '../../../shared/default-val';

import { COLUMN_DATA_TYPES } from './__constants__/data-type';

/**
 * @implements {ColumnBase}
 */
export type TinyintColumn = {
  node_type: typeof NODE_TYPES.COLUMN;
  column_ref: ColumnRef;
  data_type: typeof COLUMN_DATA_TYPES.TINYINT;
  comment: Comment | null;
  default_val: DefaultVal | null;
  nullable: boolean;
};
