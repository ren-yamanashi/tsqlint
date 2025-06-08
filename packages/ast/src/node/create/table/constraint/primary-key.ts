import { NODE_TYPES } from '../../../__constants__/node-type';
import { ColumnRef } from '../../../shared/column-ref';

import { CONSTRAINT_TYPES } from './__constants__/constraint-type';

/**
 * @implements {ConstraintBase}
 */
export type PrimaryKeyConstraint = {
  node_type: typeof NODE_TYPES.CONSTRAINT;
  constraint_type: typeof CONSTRAINT_TYPES.PRIMARY_KEY;
  columns: ColumnRef[];
};
