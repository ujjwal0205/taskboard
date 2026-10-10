"use client";

import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

import type { ListMeta } from "@/lib/board-state";
import { listNameSchema } from "@/lib/schemas";
import type { Card, Member } from "@/lib/types";

import { CardFace } from "./card-face";
import { Column, ColumnGhost } from "./column";
import { InlineComposer } from "./inline-composer";

type Columns = Record<string, string[]>;

type BoardCanvasProps = {
  lists: ListMeta[];
  cards: Record<string, Card>;
  /** Card ids per list in display order, derived from the board state. */
  columns: Columns;
  members: Record<string, Member>;
  today: string | null;
  canEdit: boolean;
  flashed: Record<string, number>;
  onMoveCard: (cardId: string, listId: string, index: number) => void;
  onMoveList: (listId: string, index: number) => void;
  onAddCard: (listId: string, title: string) => Promise<void>;
  onAddList: (name: string) => Promise<void>;
  onRenameList: (listId: string, name: string) => void;
  onOpenCard: (cardId: string) => void;
};

const typeOf = (data: { current?: Record<string, unknown> } | undefined) => data?.current?.type as string | undefined;

const findColumn = (columns: Columns, cardId: string) =>
  Object.keys(columns).find((listId) => columns[listId].includes(cardId));

/**
 * Lists only collide with lists. A dragged card targets the card under the pointer, or the
 * nearest card of the column the pointer is in, or the column itself when it is empty.
 */
const collisionDetection: CollisionDetection = (args) => {
  const only = (...types: string[]) =>
    args.droppableContainers.filter((container) => types.includes(typeOf(container.data) ?? ""));

  if (typeOf(args.active.data) === "list") {
    return closestCenter({ ...args, droppableContainers: only("list") });
  }

  const targets = only("card", "column");
  const hits = pointerWithin({ ...args, droppableContainers: targets });
  const cardHit = hits.find((hit) => typeOf(hit.data?.droppableContainer.data) === "card");
  if (cardHit) return [cardHit];

  const columnHit = hits[0];
  if (columnHit) {
    const listId = columnHit.data?.droppableContainer.data.current?.listId;
    const cardsInColumn = targets.filter(
      (container) =>
        typeOf(container.data) === "card" && container.data.current?.listId === listId && container.id !== args.active.id,
    );
    return cardsInColumn.length > 0 ? closestCenter({ ...args, droppableContainers: cardsInColumn }) : [columnHit];
  }

  return closestCorners({ ...args, droppableContainers: targets });
};

export function BoardCanvas({
  lists,
  cards,
  columns,
  members,
  today,
  canEdit,
  flashed,
  onMoveCard,
  onMoveList,
  onAddCard,
  onAddList,
  onRenameList,
  onOpenCard,
}: BoardCanvasProps) {
  const [active, setActive] = useState<{ type: "card" | "list"; id: string } | null>(null);
  // While a card is dragged, the columns shown come from this working copy, so cards can make
  // room in other lists before anything is saved.
  const [draft, setDraft] = useState<Columns | null>(null);
  const shown = draft ?? columns;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] } }),
  );

  const targetColumn = (current: Columns, over: NonNullable<DragOverEvent["over"]>) =>
    typeOf(over.data) === "column" ? (over.data.current?.listId as string) : findColumn(current, String(over.id));

  const handleDragStart = ({ active: dragged }: DragStartEvent) => {
    const type = typeOf(dragged.data) === "list" ? "list" : "card";
    setActive({ type, id: String(dragged.id) });
    if (type === "card") setDraft(columns);
  };

  const handleDragOver = ({ active: dragged, over }: DragOverEvent) => {
    if (!over || !draft || typeOf(dragged.data) !== "card") return;

    const cardId = String(dragged.id);
    const from = findColumn(draft, cardId);
    const to = targetColumn(draft, over);
    if (!from || !to || from === to) return;

    const overIndex = draft[to].indexOf(String(over.id));
    const draggedTop = dragged.rect.current.translated?.top ?? 0;
    const below = overIndex >= 0 && draggedTop > over.rect.top + over.rect.height / 2;
    const index = overIndex >= 0 ? overIndex + (below ? 1 : 0) : draft[to].length;

    setDraft({
      ...draft,
      [from]: draft[from].filter((id) => id !== cardId),
      [to]: [...draft[to].slice(0, index), cardId, ...draft[to].slice(index)],
    });
  };

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    const id = String(dragged.id);

    if (typeOf(dragged.data) === "list") {
      const from = lists.findIndex((list) => list.id === id);
      const to = over ? lists.findIndex((list) => list.id === over.id) : -1;
      if (from >= 0 && to >= 0 && from !== to) onMoveList(id, to);
    } else if (draft) {
      let finalColumns = draft;
      const column = findColumn(draft, id);
      if (column && over && typeOf(over.data) === "card" && over.id !== id && targetColumn(draft, over) === column) {
        const order = draft[column];
        finalColumns = { ...draft, [column]: arrayMove(order, order.indexOf(id), order.indexOf(String(over.id))) };
      }

      const listId = findColumn(finalColumns, id);
      if (listId) {
        const index = finalColumns[listId].indexOf(id);
        const moved = cards[id]?.listId !== listId || columns[listId]?.indexOf(id) !== index;
        if (moved) onMoveCard(id, listId, index);
      }
    }

    setActive(null);
    setDraft(null);
  };

  const handleDragCancel = () => {
    setActive(null);
    setDraft(null);
  };

  const activeCard = active?.type === "card" ? cards[active.id] : undefined;
  const activeList = active?.type === "list" ? lists.find((list) => list.id === active.id) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="scroll-thin flex flex-1 items-start gap-4 overflow-x-auto px-4 pb-6 sm:px-6">
        <SortableContext items={lists.map((list) => list.id)} strategy={horizontalListSortingStrategy}>
          {lists.map((list) => (
            <Column
              key={list.id}
              list={list}
              cards={(shown[list.id] ?? []).map((cardId) => cards[cardId]).filter((card) => card !== undefined)}
              members={members}
              today={today}
              canEdit={canEdit}
              flashed={flashed}
              onAddCard={onAddCard}
              onRenameList={onRenameList}
              onOpenCard={onOpenCard}
            />
          ))}
        </SortableContext>

        {canEdit && (
          <div className="glass w-72 shrink-0 rounded-2xl p-2">
            <InlineComposer
              schema={listNameSchema}
              openLabel={lists.length === 0 ? "Add your first list" : "Add another list"}
              submitLabel="Add list"
              placeholder="List name"
              onSubmit={onAddList}
            />
          </div>
        )}

        {!canEdit && lists.length === 0 && (
          <p className="glass rounded-2xl p-6 text-sm text-slate-400">This board has no lists yet.</p>
        )}
      </div>

      <DragOverlay>
        {activeCard && (
          <CardFace
            card={activeCard}
            assignee={activeCard.assigneeId ? members[activeCard.assigneeId] : undefined}
            today={today}
            lifted
          />
        )}
        {activeList && <ColumnGhost list={activeList} count={columns[activeList.id]?.length ?? 0} />}
      </DragOverlay>
    </DndContext>
  );
}
