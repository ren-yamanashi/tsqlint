import * as fs from 'node:fs';

import { CreateTableNode } from '@tsqlint/ast';
import nodeSqlParser from 'node-sql-parser';

const parser = new nodeSqlParser.Parser();
const sqlFile = fs.readFileSync('sample.sql', 'utf-8');

const replacedSql = sqlFile.replace(/BINARY/g, '');
const ast = parser.astify(replacedSql, { database: 'mysql' });

const newAst = (Array.isArray(ast) ? ast : [ast]).reduce<CreateTableNode[]>(
  (acc, node) => {
    switch (node.type) {
      case 'create': {
        if (node.keyword !== 'table') return acc;
        const createTableNode: CreateTableNode = {
          type: 'create',
          keyword: 'table',
          db: node.table?.[0].db ?? '',
          table_name: node.table?.[0].table ?? '',
          temporary: !!node.temporary,
          if_not_exists: !!node.if_not_exists,
          definitions: [],
        };
        return [...acc, createTableNode];
      }
      default:
        return acc;
    }
  },
  [],
);

fs.writeFileSync('ast.json', JSON.stringify(newAst));
