"use client";

import { ArrowLeft, Eye, Users, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useSession, type Session } from "@/lib/auth";
import { boardReducer, columnsOf, initialBoardState, sortedLists } from "@/lib/board-state";
import { place } from "@/lib/positions";
import type { BoardDetail, BoardEvent, Card, ListSummary, Member } from "@/lib/types";
import { useBoardSocket, type ConnectionStatus } from "@/lib/use-board-socket";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

import { BoardCanvas } from "./board-canvas";
import { CardModal, type CardUpdate } from "./card-modal";
import { MembersModal } from "./members-modal";

const fetchBoard = (boardId: string) =>
  Promise.all([api<BoardDetail>(`/boards/${boardId}`), api<Member[]>(`/boards/${boardId}/members`)]);

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Loading board" className="flex flex-1 flex-col">
      <div className="px-4 py-5 sm:px-6">
        <div className="shimmer h-8 w-56 rounded-lg" />
      </div>
      <div className="flex gap-4 px-4 sm:px-6">
        {[52, 36, 44].map((height) => (
          <div key={height} className="shimmer w-72 shrink-0 rounded-2xl border border-white/10" style={{ height: `${height * 4}px` }} />
        ))}
      </div>
    </div>
  );
}

export function BoardScreen({ boardId }: { boardId: string }) {
  const session = useSession();
  if (!session) return <BoardSkeleton />;
  return <Board key={boardId} boardId={boardId} session={session} />;
}

function Board({ boardId, session }: { boardId: string; session: Session }) {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);
  const [members, setMembers] = useState<Member[]>([]);
  const [load, setLoad] = useState<"loading" | "ready" | "missing" | "failed">("loading");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  // A counter per card; each bump replays the highlight ring on that card.
  const [flashed, setFlashed] = useState<Record<string, number>>({});
  const today = useToday();

  const applyLoaded = ([board, memberList]: [BoardDetail, Member[]]) => {
    dispatch({ type: "loaded", board });
    setMembers(memberList);
    setLoad("ready");
  };

  // A failed refresh of a board that is already on screen keeps what is shown.
  const applyLoadError = (error: unknown) => {
    const missing = error instanceof ApiError && error.status === 404;
    setLoad((current) => (missing ? "missing" : current === "ready" ? current : "failed"));
  };

  const reload = () => fetchBoard(boardId).then(applyLoaded, applyLoadError);

  const onLoaded = useEffectEvent(applyLoaded);
  const onLoadError = useEffectEvent(applyLoadError);

  useEffect(() => {
    let cancelled = false;
    fetchBoard(boardId).then(
      (result) => {
        if (!cancelled) onLoaded(result);
      },
      (error) => {
        if (!cancelled) onLoadError(error);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const handleEvent = (event: BoardEvent) => {
    switch (event.type) {
      case "CARD_CREATED":
      case "CARD_UPDATED":
      case "CARD_MOVED": {
        const card = event.payload;
        dispatch({ type: "cardUpserted", card });
        setFlashed((current) => ({ ...current, [card.id]: (current[card.id] ?? 0) + 1 }));
        break;
      }
      case "CARD_DELETED":
        dispatch({ type: "cardRemoved", id: event.payload.id });
        break;
      case "LIST_CREATED":
      case "LIST_UPDATED":
        dispatch({ type: "listUpserted", list: event.payload });
        break;
      case "BOARD_CHANGED":
        void reload();
        break;
    }
  };

  // Reloading on every connect also covers reconnects: anything missed while offline is fetched.
  const connection = useBoardSocket(boardId, session.token, { onConnect: reload, onEvent: handleEvent });

  const lists = useMemo(() => sortedLists(state), [state]);
  const columns = useMemo(() => columnsOf(state), [state]);
  const membersById = useMemo(() => Object.fromEntries(members.map((member) => [member.userId, member])), [members]);

  const role = membersById[session.user.id]?.role;
  const canEdit = role === "OWNER" || role === "EDITOR";
  const openCard = openCardId ? state.cards[openCardId] : undefined;

  /** Shows the failure and refetches, which undoes any optimistic change that was rejected. */
  const recover = (error: unknown) => {
    toast.error(errorMessage(error));
    void reload();
  };

  const moveCard = async (cardId: string, listId: string, index: number) => {
    const siblings = (columns[listId] ?? []).filter((id) => id !== cardId).map((id) => state.cards[id].position);
    dispatch({ type: "cardMovedLocally", id: cardId, listId, position: place(siblings, index) });
    try {
      const card = await api<Card>(`/cards/${cardId}/move`, { method: "POST", body: { listId, index } });
      dispatch({ type: "cardUpserted", card });
    } catch (error) {
      recover(error);
    }
  };

  const moveList = async (listId: string, index: number) => {
    const siblings = lists.filter((list) => list.id !== listId).map((list) => list.position);
    dispatch({ type: "listMovedLocally", id: listId, position: place(siblings, index) });
    try {
      const list = await api<ListSummary>(`/lists/${listId}`, { method: "PATCH", body: { index } });
      dispatch({ type: "listUpserted", list });
    } catch (error) {
      recover(error);
    }
  };

  const renameList = async (listId: string, name: string) => {
    const current = state.lists[listId];
    if (!current) return;
    dispatch({ type: "listUpserted", list: { ...current, name } });
    try {
      const list = await api<ListSummary>(`/lists/${listId}`, { method: "PATCH", body: { name } });
      dispatch({ type: "listUpserted", list });
    } catch (error) {
      recover(error);
    }
  };

  const addList = async (name: string) => {
    try {
      const list = await api<ListSummary>(`/boards/${boardId}/lists`, { method: "POST", body: { name } });
      dispatch({ type: "listUpserted", list });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const addCard = async (listId: string, title: string) => {
    try {
      const card = await api<Card>(`/lists/${listId}/cards`, { method: "POST", body: { title } });
      dispatch({ type: "cardUpserted", card });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const saveCard = async (cardId: string, update: CardUpdate) => {
    try {
      const card = await api<Card>(`/cards/${cardId}`, { method: "PATCH", body: update });
      dispatch({ type: "cardUpserted", card });
      toast.success("Card saved");
      return true;
    } catch (error) {
      // A 409 means the card moved on since the form was opened; the reload brings the latest
      // version in, and the form then offers to load it.
      recover(error);
      return false;
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await api(`/cards/${cardId}`, { method: "DELETE" });
      dispatch({ type: "cardRemoved", id: cardId });
      setOpenCardId(null);
      toast.success("Card deleted");
    } catch (error) {
      recover(error);
    }
  };

  if (load === "loading") return <BoardSkeleton />;

  if (load === "missing" || load === "failed" || !state.board) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="glass max-w-sm rounded-3xl p-8 text-center">
          <h1 className="text-lg font-semibold text-white">
            {load === "missing" ? "Board not found" : "Could not load this board"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {load === "missing"
              ? "It may have been removed, or you are not a member of it."
              : "Check that the backend is running, then try again."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/boards">
              <Button variant="subtle">Back to boards</Button>
            </Link>
            {load !== "missing" && <Button onClick={() => void reload()}>Retry</Button>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-5 sm:px-6">
        <Link
          href="/boards"
          aria-label="Back to boards"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-white">{state.board.name}</h1>
        <ConnectionPill status={connection} />
        {role === "VIEWER" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-2.5 py-1 text-xs text-slate-300">
            <Eye className="size-3.5" />
            View only
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member) => (
              <Avatar key={member.userId} id={member.userId} name={member.name} />
            ))}
            {members.length > 5 && (
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-medium text-slate-200 ring-2 ring-[#0d0d1f]">
                +{members.length - 5}
              </span>
            )}
          </div>
          <Button variant="subtle" size="sm" onClick={() => setMembersOpen(true)}>
            <Users className="size-4" />
            Members
          </Button>
        </div>
      </div>

      <BoardCanvas
        lists={lists}
        cards={state.cards}
        columns={columns}
        members={membersById}
        today={today}
        canEdit={canEdit}
        flashed={flashed}
        onMoveCard={moveCard}
        onMoveList={moveList}
        onAddCard={addCard}
        onAddList={addList}
        onRenameList={renameList}
        onOpenCard={setOpenCardId}
      />

      <CardModal
        card={openCard}
        listName={openCard ? state.lists[openCard.listId]?.name : undefined}
        members={members}
        canEdit={canEdit}
        onClose={() => setOpenCardId(null)}
        onSave={saveCard}
        onDelete={deleteCard}
      />

      <MembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        boardId={boardId}
        members={members}
        currentUserId={session.user.id}
        isOwner={role === "OWNER"}
        onChanged={setMembers}
      />
    </main>
  );
}

function ConnectionPill({ status }: { status: ConnectionStatus }) {
  const live = status === "live";
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        live ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-amber-300/30 bg-amber-400/10 text-amber-200",
      )}
    >
      {live ? (
        <>
          <span className="pulse-dot size-1.5 rounded-full bg-emerald-400" />
          <Wifi className="size-3.5" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="size-3.5" />
          {status === "connecting" ? "Connecting…" : "Reconnecting…"}
        </>
      )}
    </span>
  );
}
