import { ColumnRef } from '../../../shared/column-ref';
import { NODE_TYPES } from '../../../shared/node-type';

import { ConstraintBase } from './private/base';
import { CONSTRAINT_TYPES } from './private/constraint-type';

export interface PrimaryConstraint
  extends ConstraintBase<typeof NODE_TYPES.PRIMARY_CONSTRAINT, typeof CONSTRAINT_TYPES.PRIMARY> {
  columns: ColumnRef[];
}
