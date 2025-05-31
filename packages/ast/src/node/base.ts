export const NODE_TYPES = {
  CREATE: 'create',
  LIKE: 'like',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export interface Node<T extends NodeType> {
  type: T;
}
