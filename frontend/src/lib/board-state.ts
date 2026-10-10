import type { BoardDetail, Card, ListSummary } from "./types";

export type ListMeta = { id: string; name: string; position: number };

export type BoardState = {
  board: { id: string; name: string; ownerId: string } | null;
  lists: Record<string, ListMeta>;
  cards: Record<string, Card>;
};

export type BoardAction =
  | { type: "loaded"; board: BoardDetail }
  | { type: "cardUpserted"; card: Card }
  | { type: "cardRemoved"; id: string }
  | { type: "cardMovedLocally"; id: string; listId: string; position: number }
  | { type: "listUpserted"; list: ListSummary | ListMeta }
  | { type: "listMovedLocally"; id: string; position: number };

export const initialBoardState: BoardState = { board: null, lists: {}, cards: {} };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "loaded": {
      const lists: Record<string, ListMeta> = {};
      const cards: Record<string, Card> = {};
      for (const list of action.board.lists) {
        lists[list.id] = { id: list.id, name: list.name, position: list.position };
        for (const card of list.cards) {
          cards[card.id] = card;
        }
      }
      const { id, name, ownerId } = action.board;
      return { board: { id, name, ownerId }, lists, cards };
    }

    case "cardUpserted": {
      // The version decides: a server copy at the same or a newer version replaces the local one,
      // which is how an optimistic move is reconciled with the confirmed result.
      const existing = state.cards[action.card.id];
      if (existing && action.card.version < existing.version) {
        return state;
      }
      return { ...state, cards: { ...state.cards, [action.card.id]: action.card } };
    }

    case "cardRemoved": {
      if (!state.cards[action.id]) return state;
      const cards = { ...state.cards };
      delete cards[action.id];
      return { ...state, cards };
    }

    case "cardMovedLocally": {
      const card = state.cards[action.id];
      if (!card) return state;
      return {
        ...state,
        cards: { ...state.cards, [action.id]: { ...card, listId: action.listId, position: action.position } },
      };
    }

    case "listUpserted": {
      const { id, name, position } = action.list;
      return { ...state, lists: { ...state.lists, [id]: { id, name, position } } };
    }

    case "listMovedLocally": {
      const list = state.lists[action.id];
      if (!list) return state;
      return { ...state, lists: { ...state.lists, [action.id]: { ...list, position: action.position } } };
    }
  }
}

const byPosition = <T extends { id: string; position: number }>(a: T, b: T) =>
  a.position - b.position || a.id.localeCompare(b.id);

export function sortedLists(state: BoardState): ListMeta[] {
  return Object.values(state.lists).sort(byPosition);
}

/** Card ids per list, in display order. Every list has an entry, even when empty. */
export function columnsOf(state: BoardState): Record<string, string[]> {
  const columns: Record<string, string[]> = {};
  for (const listId of Object.keys(state.lists)) {
    columns[listId] = [];
  }
  for (const card of Object.values(state.cards).sort(byPosition)) {
    columns[card.listId]?.push(card.id);
  }
  return columns;
}
