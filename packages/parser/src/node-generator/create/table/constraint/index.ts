import { ConstraintDefinition, NODE_TYPES } from '@tsqlint/ast';

import { generateForeignKeyConstraint } from './foreign-key';
import { generatePrimaryKeyConstraint } from './primary-key';
import { ConstraintDefinitionNode } from './types/constraint-definition-node';

export const generateConstraintDefinition = (
  node: ConstraintDefinitionNode,
): ConstraintDefinition | null => {
  switch (node.constraint_type) {
    case 'primary key': {
      return {
        node_type: NODE_TYPES.CONSTRAINT_DEFINITION,
        constraint: generatePrimaryKeyConstraint(node),
      };
    }
    case 'FOREIGN KEY': {
      return {
        node_type: NODE_TYPES.CONSTRAINT_DEFINITION,
        constraint: generateForeignKeyConstraint(node),
      };
    }
    default: {
      return null;
    }
  }
};
