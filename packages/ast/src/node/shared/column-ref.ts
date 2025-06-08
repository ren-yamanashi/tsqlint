import { NODE_TYPES } from '../__constants__/node-type';

export interface ColumnRef {
  node_type: typeof NODE_TYPES.COLUMN_REF;
  column_name: string;
}
