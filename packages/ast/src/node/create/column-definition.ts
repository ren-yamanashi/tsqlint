/* eslint-disable @typescript-eslint/no-empty-object-type */

import { DATA_TYPES, DataType } from '../common/data-type';
import { Node, NODE_TYPES } from '../common/node';
import {
  CommentNode,
  DefaultValueNode,
  ExpressionListNode,
} from '../common/value';

export interface ColumnRef extends Node<typeof NODE_TYPES.COLUMN_REF> {
  column_name: string;
}

interface AbstractColumn<T extends DataType> {
  column_ref: ColumnRef;
  data_type: T;
  comment: CommentNode | null;
  default_val: DefaultValueNode | null;
  nullable: boolean;
  // suffix: DataTypeSuffix[];
}

export interface Datetime extends AbstractColumn<typeof DATA_TYPES.DATETIME> {}

export interface Tinyint extends AbstractColumn<typeof DATA_TYPES.TINYINT> {}

export interface Bigint extends AbstractColumn<typeof DATA_TYPES.BIGINT> {
  unsigned: boolean;
  auto_increment: boolean;
}

export interface Varchar extends AbstractColumn<typeof DATA_TYPES.VARCHAR> {
  length: number | null;
  parentheses: boolean;
}

export interface Enum extends AbstractColumn<typeof DATA_TYPES.ENUM> {
  expression_list: ExpressionListNode;
}

export type Column = Bigint | Varchar | Tinyint | Enum | Datetime;

export interface CreateColumnDefinition {
  type: 'column_definition';
  column: Column;
}

export interface CreateConstraintPrimary {
  type: 'constraint_primary';
  column_name: ColumnRef[];
}

export type CreateDefinition = CreateColumnDefinition | CreateConstraintPrimary;
