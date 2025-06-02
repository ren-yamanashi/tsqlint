import { COLUMN_DATA_TYPES, ColumnDefinition } from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../../../common/types/unwrap-array';

import { generateBigintColumn } from './bigint';
import { generateDatetimeColumn } from './datetime';
import { generateEnumColumn } from './enum';
import { generateTinyintColumn } from './tinyint';
import { generateVarcharColumn } from './varchar';

export const generateColumnDefinition = (
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): ColumnDefinition | null => {
  switch (node.resource) {
    case 'column': {
      const definition = node.definition;
      const dataType = definition.dataType.toLowerCase();
      switch (dataType) {
        case COLUMN_DATA_TYPES.DATETIME: {
          return {
            node_type: 'column_definition',
            column: generateDatetimeColumn(node),
          };
        }
        case COLUMN_DATA_TYPES.TINYINT: {
          return {
            node_type: 'column_definition',
            column: generateTinyintColumn(node),
          };
        }
        case COLUMN_DATA_TYPES.BIGINT: {
          return {
            node_type: 'column_definition',
            column: generateBigintColumn(node),
          };
        }
        case COLUMN_DATA_TYPES.VARCHAR: {
          return {
            node_type: 'column_definition',
            column: generateVarcharColumn(node),
          };
        }
        case COLUMN_DATA_TYPES.ENUM: {
          return {
            node_type: 'column_definition',
            column: generateEnumColumn(node),
          };
        }
        default:
          return null;
      }
    }
    default:
      return null;
  }
};
