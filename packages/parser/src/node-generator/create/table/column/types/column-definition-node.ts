import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../../../../common/types/unwrap-array';

type ExtractColumnDefinition<T> = T extends { resource: 'column' } ? T : never;

export type ColumnDefinitionNode = ExtractColumnDefinition<
  UnwrapArray<NonNullable<nodeSqlParser.Create['create_definitions']>>
>;
