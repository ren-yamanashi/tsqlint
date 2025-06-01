/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Node, NODE_TYPES } from '../base';
import { DATA_TYPES, DataType } from '../common/data-type';
import {
  CommentNode,
  DefaultValueNode,
  ExpressionListNode,
} from '../common/value';

interface ColumnRef extends Node<typeof NODE_TYPES.COLUMN_REF> {
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

interface Datetime extends AbstractColumn<typeof DATA_TYPES.DATETIME> {}

interface Tinyint extends AbstractColumn<typeof DATA_TYPES.TINYINT> {}

interface Bigint extends AbstractColumn<typeof DATA_TYPES.BIGINT> {
  unsigned: boolean;
  auto_increment: boolean;
}

interface Varchar extends AbstractColumn<typeof DATA_TYPES.VARCHAR> {
  length: number;
  parentheses: boolean;
}

interface Enum extends AbstractColumn<typeof DATA_TYPES.ENUM> {
  expression_list: ExpressionListNode;
}

type Column = Bigint | Varchar | Tinyint | Enum | Datetime;

interface CreateColumnDefinition {
  type: 'column_definition';
  column: Column;
}

interface CreateConstraintPrimary {
  type: 'constraint_primary';
  column_name: ColumnRef[];
}

export type CreateDefinition = CreateColumnDefinition | CreateConstraintPrimary;
