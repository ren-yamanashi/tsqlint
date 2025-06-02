import { ColumnDefinition } from './column';
import { ConstraintDefinition } from './constraint';

export type CreateTableDefinition = ColumnDefinition | ConstraintDefinition;
