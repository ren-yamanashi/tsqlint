import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../../../../common/types/unwrap-array';

type ExtractConstraintDefinition<T> = T extends { resource: 'constraint' } ? T : never;

export type ConstraintDefinitionNode = ExtractConstraintDefinition<
  UnwrapArray<NonNullable<nodeSqlParser.Create['create_definitions']>>
>;
