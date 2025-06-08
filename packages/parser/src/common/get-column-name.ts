import nodeSqlParser from 'node-sql-parser';

export const getColumnName = (column: nodeSqlParser.ColumnRef): string => {
  const columnName = column.type === 'column_ref' ? column.column : null;
  if (!columnName) return '';
  if (typeof columnName === 'string') return columnName;
  return String(columnName.expr.value);
};
