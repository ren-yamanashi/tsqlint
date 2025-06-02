import { NODE_TYPES } from './node-type';
import { ValueType } from './value';

export interface DefaultVal {
  node_type: typeof NODE_TYPES.DEFAULT_VAL;
  value: {
    type: ValueType;
    value: string | number | boolean | null;
  };
}
