import { ColumnRef } from '../../../shared/column-ref';

import { ConstraintBase } from './private/base';
import { CONSTRAINT_TYPES } from './private/constraint-type';

export interface PrimaryConstraint extends ConstraintBase<typeof CONSTRAINT_TYPES.PRIMARY> {
  columns: ColumnRef[];
}
