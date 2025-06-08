import { NODE_TYPES } from '../../../__constants__/node-type';

import { ConstraintType } from './__constants__/constraint-type';

export interface ConstraintBase {
  node_type: typeof NODE_TYPES.CONSTRAINT;
  constraint_type: ConstraintType;
}
