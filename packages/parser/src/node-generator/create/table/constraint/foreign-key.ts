import {
  CONSTRAINT_TYPES,
  ForeignKeyConstraint,
  ForeignKeyReferenceDefinition,
  NODE_TYPES,
  ON_ACTION_VALUES,
  OnAction,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { getColumnName } from '../../../../common/get-column-name';

import { generateConstraintBase } from './base';
import { ConstraintDefinitionNode } from './types/constraint-definition-node';

type ForeignKeyConstraintDefinition<T> = T extends { constraint_type: 'FOREIGN KEY' } ? T : never;

type ForeignKeyConstraintDefinitionNode = ForeignKeyConstraintDefinition<ConstraintDefinitionNode>;

export const generateForeignKeyConstraint = (
  node: ForeignKeyConstraintDefinitionNode,
): ForeignKeyConstraint => {
  const base = generateConstraintBase(CONSTRAINT_TYPES.FOREIGN_KEY);
  return {
    ...base,
    name: node.constraint ?? '',
    reference_definition: generateReferenceDefinition(node),
  };
};

const generateReferenceDefinition = (
  node: ForeignKeyConstraintDefinitionNode,
): ForeignKeyReferenceDefinition => {
  const referenceDefinition: unknown = node.reference_definition;
  if (!isReferenceDefinition(referenceDefinition)) {
    return {
      node_type: NODE_TYPES.FOREIGN_KEY_REFERENCE_DEFINITION,
      column: {
        node_type: NODE_TYPES.COLUMN_REF,
        column_name: '',
      },
      table_name: '',
      db: null,
      on_action: [],
    };
  }
  return {
    node_type: NODE_TYPES.FOREIGN_KEY_REFERENCE_DEFINITION,
    column: {
      node_type: NODE_TYPES.COLUMN_REF,
      column_name: getColumnName(referenceDefinition.definition[0]),
    },
    table_name: referenceDefinition.table[0].table,
    db: referenceDefinition.table[0].db ?? null,
    on_action: referenceDefinition.on_action.map(generateOnAction),
  };
};

const generateOnAction = (arg: {
  type: string;
  value: {
    type: string;
    value: string;
  };
}): OnAction => {
  const { type, value } = arg;
  return {
    type: type === 'on update' ? 'on_update' : 'on_delete',
    value:
      value.value === 'restrict'
        ? ON_ACTION_VALUES.RESTRICT
        : value.value === 'cascade'
          ? ON_ACTION_VALUES.CASCADE
          : value.value === 'set null'
            ? ON_ACTION_VALUES.SET_NULL
            : value.value === 'no action'
              ? ON_ACTION_VALUES.NO_ACTION
              : ON_ACTION_VALUES.SET_DEFAULT,
  };
};

const isReferenceDefinition = (
  arg: unknown,
): arg is {
  definition: nodeSqlParser.ColumnRef[];
  table: { db: string | null; table: string }[];
  keyword: 'references';
  on_action: {
    type: string;
    value: {
      type: string;
      value: string;
    };
  }[];
} => {
  if (typeof arg !== 'object' || arg == null) return false;

  // NOTE: Check 'definition'
  const definition = 'definition' in arg && Array.isArray(arg.definition) ? arg.definition : null;
  const checkedDefinition = definition?.every(
    (df): df is nodeSqlParser.ColumnRef =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof df === 'object' && df != null && 'type' in df && df.type === 'column_ref',
  )
    ? definition
    : null;

  // NOTE: Check 'table'
  const table = 'table' in arg && Array.isArray(arg.table) ? arg.table : null;
  const checkedTable = table?.every(
    (t): t is { db: string; table: string } =>
      typeof t === 'object' &&
      t != null &&
      'db' in t &&
      'table' in t &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (typeof t.db === 'string' || t.db == null) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof t.table === 'string',
  )
    ? table
    : null;

  // NOTE: Check 'on_action'
  const onAction = 'on_action' in arg && Array.isArray(arg.on_action) ? arg.on_action : null;
  const checkedOnAction = onAction?.every(
    (oa): oa is { type: string; value: { type: string; value: string } } =>
      typeof oa === 'object' &&
      oa != null &&
      'type' in oa &&
      'value' in oa &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof oa.type === 'string' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof oa.value === 'object' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      oa.value != null &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      'type' in oa.value &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      'value' in oa.value && // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof oa.value.type === 'string' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof oa.value.value === 'string',
  )
    ? onAction
    : null;

  return (
    !!checkedDefinition &&
    !!checkedTable?.length &&
    !!checkedOnAction?.length &&
    'keyword' in arg &&
    typeof arg.keyword === 'string'
  );
};
