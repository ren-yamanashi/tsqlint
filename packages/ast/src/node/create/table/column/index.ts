import { NODE_TYPES } from '../../../__constants__/node-type';

import { BigintColumn } from './bigint';
import { DatetimeColumn } from './datetime';
import { EnumColumn } from './enum';
import { TinyintColumn } from './tinyint';
import { VarcharColumn } from './varchar';

export interface ColumnDefinition {
  node_type: typeof NODE_TYPES.COLUMN_DEFINITION;
  column: BigintColumn | VarcharColumn | TinyintColumn | EnumColumn | DatetimeColumn;
}

export * from './__constants__/data-type';
export * from './base';
export * from './bigint';
export * from './datetime';
export * from './enum';
export * from './tinyint';
export * from './varchar';
