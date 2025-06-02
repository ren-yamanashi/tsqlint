export const COLUMN_DATA_TYPES = {
  BIGINT: 'bigint',
  VARCHAR: 'varchar',
  TINYINT: 'tinyint',
  ENUM: 'enum',
  DATETIME: 'datetime',
} as const;

export type ColumnDataType = (typeof COLUMN_DATA_TYPES)[keyof typeof COLUMN_DATA_TYPES];
