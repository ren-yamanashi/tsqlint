export const ON_ACTION_VALUES = {
  CASCADE: 'cascade',
  SET_NULL: 'set_null',
  SET_DEFAULT: 'set_default',
  RESTRICT: 'restrict',
  NO_ACTION: 'no_action',
} as const;

export type OnActionValues = (typeof ON_ACTION_VALUES)[keyof typeof ON_ACTION_VALUES];
