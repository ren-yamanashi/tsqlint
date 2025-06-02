import { NODE_TYPES } from '../../../shared/node-type';
import { ValueType } from '../../../shared/value';

import { ColumnBase } from './private/base';
import { COLUMN_DATA_TYPES } from './private/data-type';

export interface ExpressionListNode {
  node_type: typeof NODE_TYPES.EXPRESSION_LIST;
  value: {
    type: ValueType;
    value: string | number | boolean | null;
  }[];
  parentheses: boolean;
}

export interface EnumColumn
  extends ColumnBase<typeof NODE_TYPES.ENUM_COLUMN, typeof COLUMN_DATA_TYPES.ENUM> {
  expression_list: ExpressionListNode;
}
