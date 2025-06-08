import { NODE_TYPES } from '../../../__constants__/node-type';

import { ForeignKeyConstraint } from './foreign-key';
import { PrimaryKeyConstraint } from './primary-key';

export interface ConstraintDefinition {
  node_type: typeof NODE_TYPES.CONSTRAINT_DEFINITION;
  constraint: PrimaryKeyConstraint | ForeignKeyConstraint;
}

export * from './__constants__/constraint-type';
export * from './__constants__/on-action-values';
export * from './base';
export * from './foreign-key';
export * from './primary-key';
