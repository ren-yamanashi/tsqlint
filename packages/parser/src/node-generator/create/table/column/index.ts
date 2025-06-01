import { DATA_TYPES, type CreateColumnDefinition } from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { UnwrapArray } from '../../../../common/types/unwrap-array';

import { generateBigintColumn } from './bigint';
import { generateDatetimeColumn } from './datetime';
import { generateEnumColumn } from './enum';
import { generateTinyintColumn } from './tinyint';
import { generateVarcharColumn } from './varchar';

export const createColumnDefinition = (
  node: UnwrapArray<nodeSqlParser.Create['create_definitions']>,
): CreateColumnDefinition | null => {
  switch (node.resource) {
    case 'column': {
      const definition = node.definition;
      const dataType = definition.dataType.toLowerCase();
      switch (dataType) {
        case DATA_TYPES.DATETIME: {
          return {
            type: 'column_definition',
            column: generateDatetimeColumn(node),
          };
        }
        case DATA_TYPES.TINYINT: {
          return {
            type: 'column_definition',
            column: generateTinyintColumn(node),
          };
        }
        case DATA_TYPES.BIGINT: {
          return {
            type: 'column_definition',
            column: generateBigintColumn(node),
          };
        }
        case DATA_TYPES.VARCHAR: {
          return {
            type: 'column_definition',
            column: generateVarcharColumn(node),
          };
        }
        case DATA_TYPES.ENUM: {
          return {
            type: 'column_definition',
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
