export const DATA_TYPES = {
  BIGINT: 'bigint',
  VARCHAR: 'varchar',
  TINYINT: 'tinyint',
  ENUM: 'enum',
  DATETIME: 'datetime',
} as const;

export type DataType = (typeof DATA_TYPES)[keyof typeof DATA_TYPES];

export const DATA_TYPE_SUFFIXES = {
  UNSIGNED: 'unsigned',
} as const;

export type DataTypeSuffix =
  (typeof DATA_TYPE_SUFFIXES)[keyof typeof DATA_TYPE_SUFFIXES];
