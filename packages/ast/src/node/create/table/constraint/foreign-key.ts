import { NODE_TYPES } from '../../../__constants__/node-type';
import { ColumnRef } from '../../../shared/column-ref';

import { CONSTRAINT_TYPES } from './__constants__/constraint-type';
import { OnActionValues } from './__constants__/on-action-values';

/**
 * @implements {ConstraintBase}
 */
export type ForeignKeyConstraint = {
  node_type: typeof NODE_TYPES.CONSTRAINT;
  constraint_type: typeof CONSTRAINT_TYPES.FOREIGN_KEY;
  name: string;
  reference_definition: ForeignKeyReferenceDefinition;
};

export type ForeignKeyReferenceDefinition = {
  node_type: typeof NODE_TYPES.FOREIGN_KEY_REFERENCE_DEFINITION;
  column: ColumnRef;
  table_name: string;
  db: string | null;
  on_action: OnAction[];
};

export type OnAction = {
  type: 'on_update' | 'on_delete';
  value: OnActionValues;
};
