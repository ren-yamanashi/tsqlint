import { ColumnRef } from '../../../../shared/column-ref';
import { Comment } from '../../../../shared/comment';
import { DefaultVal } from '../../../../shared/default-val';
import { NodeType } from '../../../../shared/node-type';

import { ColumnDataType } from './data-type';

export interface ColumnBase<T extends NodeType, U extends ColumnDataType> {
  node_type: T;
  column_ref: ColumnRef;
  data_type: U;
  comment: Comment | null;
  default_val: DefaultVal | null;
  nullable: boolean;
}
