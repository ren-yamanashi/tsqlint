import { BigintColumn, COLUMN_DATA_TYPES, NODE_TYPES } from '@tsqlint/ast';

import { generateColumnBase } from './base';
import { ColumnDefinitionNode } from './types/column-definition-node';

export const generateBigintColumn = (node: ColumnDefinitionNode): BigintColumn => {
  const base = generateColumnBase(node);
  const unsigned = Array.isArray(node.definition.suffix)
    ? node.definition.suffix[0] === 'UNSIGNED'
    : false;
  return {
    ...base(NODE_TYPES.BIGINT_COLUMN, COLUMN_DATA_TYPES.BIGINT),
    unsigned,
    auto_increment: !!node.auto_increment,
  } as BigintColumn;
};
