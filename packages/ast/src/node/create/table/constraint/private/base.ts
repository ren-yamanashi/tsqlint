import { NODE_TYPES } from '../../../../shared/node-type';

import { ConstraintType } from './constraint-type';

export interface ConstraintBase<T extends ConstraintType> {
  node_type: typeof NODE_TYPES.CONSTRAINT;
  constraint_type: T;
}
