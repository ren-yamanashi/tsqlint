import { COLUMN_DATA_TYPES, ColumnDefinition, NODE_TYPES } from '@tsqlint/ast';

import { generateBigintColumn } from './bigint';
import { generateDatetimeColumn } from './datetime';
import { generateEnumColumn } from './enum';
import { generateTinyintColumn } from './tinyint';
import { ColumnDefinitionNode } from './types/column-definition-node';
import { generateVarcharColumn } from './varchar';

export const generateColumnDefinition = (node: ColumnDefinitionNode): ColumnDefinition | null => {
  const definition = node.definition;
  const dataType = definition.dataType.toLowerCase();
  switch (dataType) {
    case COLUMN_DATA_TYPES.DATETIME: {
      return {
        node_type: NODE_TYPES.COLUMN_DEFINITION,
        column: generateDatetimeColumn(node),
      };
    }
    case COLUMN_DATA_TYPES.TINYINT: {
      return {
        node_type: NODE_TYPES.COLUMN_DEFINITION,
        column: generateTinyintColumn(node),
      };
    }
    case COLUMN_DATA_TYPES.BIGINT: {
      return {
        node_type: NODE_TYPES.COLUMN_DEFINITION,
        column: generateBigintColumn(node),
      };
    }
    case COLUMN_DATA_TYPES.VARCHAR: {
      return {
        node_type: NODE_TYPES.COLUMN_DEFINITION,
        column: generateVarcharColumn(node),
      };
    }
    case COLUMN_DATA_TYPES.ENUM: {
      return {
        node_type: NODE_TYPES.COLUMN_DEFINITION,
        column: generateEnumColumn(node),
      };
    }
    default:
      return null;
  }
};
