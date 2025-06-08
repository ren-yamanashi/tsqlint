export const CONSTRAINT_TYPES = {
  PRIMARY_KEY: 'primary_key',
  FOREIGN_KEY: 'foreign_key',
} as const;

export type ConstraintType = (typeof CONSTRAINT_TYPES)[keyof typeof CONSTRAINT_TYPES];
