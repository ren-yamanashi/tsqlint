import { NODE_TYPES } from '../__constants__/node-type';
import { ValueType } from '../__constants__/value-type';

export interface DefaultVal {
  node_type: typeof NODE_TYPES.DEFAULT_VAL;
  value: {
    type: ValueType;
    value: string | number | boolean | null;
  };
}
