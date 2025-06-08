import { ColumnRef, CONSTRAINT_TYPES, NODE_TYPES, PrimaryKeyConstraint } from '@tsqlint/ast';

import { getColumnName } from '../../../../common/get-column-name';

import { generateConstraintBase } from './base';
import { ConstraintDefinitionNode } from './types/constraint-definition-node';

type PrimaryKeyConstraintDefinition<T> = T extends { constraint_type: 'primary key' } ? T : never;

type PrimaryKeyConstraintDefinitionNode = PrimaryKeyConstraintDefinition<ConstraintDefinitionNode>;

export const generatePrimaryKeyConstraint = (
  node: PrimaryKeyConstraintDefinitionNode,
): PrimaryKeyConstraint => {
  const base = generateConstraintBase(CONSTRAINT_TYPES.PRIMARY_KEY);
  const columns: ColumnRef[] = node.definition.map(df => ({
    node_type: NODE_TYPES.COLUMN_REF,
    column_name: getColumnName(df),
  }));
  return {
    ...base,
    columns,
  };
};
