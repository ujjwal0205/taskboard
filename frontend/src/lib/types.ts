export type User = { id: string; email: string; name: string };

export type AuthResponse = { token: string; user: User };

export type BoardSummary = { id: string; name: string; ownerId: string; createdAt: string };

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Card = {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  position: number;
  dueDate: string | null;
  priority: Priority | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ListSummary = { id: string; boardId: string; name: string; position: number };

export type ListDetail = { id: string; name: string; position: number; cards: Card[] };

export type BoardDetail = BoardSummary & { lists: ListDetail[] };

export type Role = "OWNER" | "EDITOR" | "VIEWER";

export type Member = { userId: string; name: string; email: string; role: Role };

// Mirrors the backend's BoardEvent envelope broadcast on /topic/board/{boardId}.
export type BoardEvent =
  | { type: "CARD_CREATED" | "CARD_UPDATED" | "CARD_MOVED"; boardId: string; payload: Card }
  | { type: "CARD_DELETED"; boardId: string; payload: { id: string; listId: string } }
  | { type: "LIST_CREATED" | "LIST_UPDATED"; boardId: string; payload: ListSummary }
  | { type: "BOARD_CHANGED"; boardId: string; payload: null };
