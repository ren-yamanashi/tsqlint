import { NODE_TYPES } from '../../../shared/node-type';

import { PrimaryConstraint } from './primary';

export interface ConstraintDefinition {
  node_type: typeof NODE_TYPES.CONSTRAINT_DEFINITION;
  constraint: PrimaryConstraint;
}

export * from './primary';
export * from './private/base';
export * from './private/constraint-type';
