export type Presence = {
  name: string;
  avatarUrl: string | null;
  cursor: { x: number; y: number } | null;
};

export type UserMeta = {
  info: {
    name: string;
    avatarUrl: string | null;
  };
};

export type BroadcastedEvent = {
  type: "new-message";
  message: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    userId?: string;
  };
};
