import { NODE_TYPES } from './node-type';

export interface ColumnRef {
  node_type: typeof NODE_TYPES.COLUMN_REF;
  column_name: string;
}
