import * as fs from 'node:fs';

import {
  CREATE_NODE_KEYWORDS,
  NODE_TYPES,
  type CreateTableNode,
} from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

import { generateCreateTableNode } from './node-generator/create/table';

const parser = new nodeSqlParser.Parser();
const sqlFile = fs.readFileSync('sample.sql', 'utf-8');

const replacedSql = sqlFile.replace(/BINARY/g, '');
const ast = parser.astify(replacedSql, { database: 'mysql' });

const ListOfAstNode = (Array.isArray(ast) ? ast : [ast]).reduce<
  CreateTableNode[]
>((acc, node) => {
  switch (node.type) {
    case NODE_TYPES.CREATE: {
      if (node.keyword !== CREATE_NODE_KEYWORDS.TABLE) return acc;
      const createTableNode = generateCreateTableNode(node);
      return [...acc, createTableNode];
    }
    default:
      return acc;
  }
}, []);

fs.writeFileSync('ast.json', JSON.stringify(ListOfAstNode));
