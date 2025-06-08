import { NODE_TYPES } from '../../../__constants__/node-type';
import { ValueType } from '../../../__constants__/value-type';
import { ColumnRef } from '../../../shared/column-ref';
import { Comment } from '../../../shared/comment';
import { DefaultVal } from '../../../shared/default-val';

import { COLUMN_DATA_TYPES } from './__constants__/data-type';

export interface ExpressionListNode {
  node_type: typeof NODE_TYPES.EXPRESSION_LIST;
  value: {
    type: ValueType;
    value: string | number | boolean | null;
  }[];
  parentheses: boolean;
}

/**
 * @implements {ColumnBase}
 */
export interface EnumColumn {
  node_type: typeof NODE_TYPES.COLUMN;
  column_ref: ColumnRef;
  data_type: typeof COLUMN_DATA_TYPES.ENUM;
  comment: Comment | null;
  default_val: DefaultVal | null;
  nullable: boolean;
  expression_list: ExpressionListNode;
}
