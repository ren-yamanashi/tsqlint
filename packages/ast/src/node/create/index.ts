import { Node, NODE_TYPES } from '../base';
import { CommentNode } from '../common/value';
import { DataType, DataTypeSuffix } from '../common/data-type';

/**
 * MySQL CREATE node types.
 */
export const CREATE_NODE_KEYWORDS = {
  TABLE: 'table',
  INDEX: 'index',
  DATABASE: 'database',
  USER: 'user',
} as const;

export type CreateNodeKeyword =
  (typeof CREATE_NODE_KEYWORDS)[keyof typeof CREATE_NODE_KEYWORDS];

export interface CreateTableNode extends Node<typeof NODE_TYPES.CREATE> {
  keyword: typeof CREATE_NODE_KEYWORDS.TABLE;
  db: string;
  table_name: string;
  temporary: boolean;
  if_not_exists: boolean;
  definitions: unknown[];
}

interface CreateColumnDefinition {
  type: 'column_definition';
  column: {
    type: 'column_ref';
    column_name: string;
  };
  definition: {
    data_type: DataType;
    suffix: DataTypeSuffix[];
  };
  nullable: boolean;
  auto_increment: boolean;
  comment: CommentNode;
}

interface ColumnValue {}

// interface CreateLikeNode extends Node<typeof NODE_TYPES.CREATE> {
//   table: string;
//   parentheses: boolean;
// }
