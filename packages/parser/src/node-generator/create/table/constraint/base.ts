import { ConstraintBase, ConstraintType, NODE_TYPES } from '@tsqlint/ast';

export const generateConstraintBase = <T extends ConstraintType>(
  constraintType: T,
): Omit<ConstraintBase, 'constraint_type'> & { constraint_type: T } => {
  return {
    node_type: NODE_TYPES.CONSTRAINT,
    constraint_type: constraintType,
  };
};
