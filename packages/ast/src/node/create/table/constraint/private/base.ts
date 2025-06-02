import { NodeType } from '../../../../shared/node-type';

import { ConstraintType } from './constraint-type';

export interface ConstraintBase<T extends NodeType, U extends ConstraintType> {
  node_type: T;
  constraint_type: U;
}
