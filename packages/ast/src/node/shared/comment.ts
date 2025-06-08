import { NODE_TYPES } from '../__constants__/node-type';
import { VALUE_TYPES } from '../__constants__/value-type';

export interface Comment {
  node_type: typeof NODE_TYPES.COMMENT;
  value: {
    type: typeof VALUE_TYPES.SINGLE_QUOTE_STRING | typeof VALUE_TYPES.DOUBLE_QUOTE_STRING;
    value: string;
  };
}
