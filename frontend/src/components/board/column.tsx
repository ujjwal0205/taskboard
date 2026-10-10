"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import type { ListMeta } from "@/lib/board-state";
import { cardTitleSchema } from "@/lib/schemas";
import type { Card, Member } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CardFace } from "./card-face";
import { InlineComposer } from "./inline-composer";

type SharedProps = {
  members: Record<string, Member>;
  today: string | null;
  canEdit: boolean;
  flashed: Record<string, number>;
  onOpenCard: (cardId: string) => void;
};

type ColumnProps = SharedProps & {
  list: ListMeta;
  cards: Card[];
  onAddCard: (listId: string, title: string) => Promise<void>;
  onRenameList: (listId: string, name: string) => void;
};

export function Column({ list, cards, canEdit, onAddCard, onRenameList, ...shared }: ColumnProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list" },
    disabled: !canEdit,
  });
  const { setNodeRef: setCardsRef } = useDroppable({
    id: `column:${list.id}`,
    data: { type: "column", listId: list.id },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("w-72 shrink-0", isDragging && "opacity-40")}
    >
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        aria-label={list.name}
        className="glass flex max-h-[calc(100dvh-11rem)] flex-col rounded-2xl"
      >
        <header className="flex items-center gap-1.5 px-3 pb-1 pt-3">
          {canEdit && (
            <button
              type="button"
              aria-label={`Drag list ${list.name}`}
              className="cursor-grab touch-none rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-200 active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
          )}
          <ListName name={list.name} canEdit={canEdit} onRename={(name) => onRenameList(list.id, name)} />
          <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {cards.length}
          </span>
        </header>

        <div ref={setCardsRef} className="scroll-thin flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto p-3">
          <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} columnId={list.id} canEdit={canEdit} {...shared} />
            ))}
          </SortableContext>
          {cards.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 px-3 py-5 text-center text-xs text-slate-500">
              {canEdit ? "Drop a card here" : "No cards"}
            </p>
          )}
        </div>

        {canEdit && (
          <InlineComposer
            className="px-3 pb-3"
            schema={cardTitleSchema}
            openLabel="Add a card"
            submitLabel="Add card"
            placeholder="What needs doing?"
            onSubmit={(title) => onAddCard(list.id, title)}
          />
        )}
      </motion.section>
    </div>
  );
}

function ListName({ name, canEdit, onRename }: { name: string; canEdit: boolean; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <h2 className="min-w-0 flex-1">
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => setEditing(true)}
          title={canEdit ? "Rename list" : undefined}
          className="block w-full truncate rounded-md px-1.5 py-1 text-left text-sm font-semibold text-white enabled:hover:bg-white/8"
        >
          {name}
        </button>
      </h2>
    );
  }

  const commit = (value: string) => {
    const next = value.trim();
    if (next && next !== name && next.length <= 100) onRename(next);
    setEditing(false);
  };

  return (
    <input
      autoFocus
      defaultValue={name}
      maxLength={100}
      aria-label="List name"
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit(event.currentTarget.value);
        if (event.key === "Escape") setEditing(false);
      }}
      className="min-w-0 flex-1 rounded-md border border-violet-400/60 bg-white/8 px-1.5 py-1 text-sm font-semibold text-white outline-none"
    />
  );
}

type SortableCardProps = SharedProps & { card: Card; columnId: string };

function SortableCard({ card, columnId, members, today, canEdit, flashed, onOpenCard }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", listId: columnId },
    disabled: !canEdit,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("touch-manipulation rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400", isDragging && "opacity-30")}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={`Open card ${card.title}`}
      onClick={() => onOpenCard(card.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !isDragging && event.target === event.currentTarget) {
          onOpenCard(card.id);
          return;
        }
        listeners?.onKeyDown?.(event);
      }}
    >
      <CardFace
        card={card}
        assignee={card.assigneeId ? members[card.assigneeId] : undefined}
        today={today}
        flash={flashed[card.id]}
      />
    </div>
  );
}

/** The simplified column shown under the cursor while a list is being dragged. */
export function ColumnGhost({ list, count }: { list: ListMeta; count: number }) {
  return (
    <div className="glass w-72 rotate-2 cursor-grabbing rounded-2xl border-violet-300/50 p-3 shadow-2xl shadow-violet-950/70">
      <div className="flex items-center gap-2">
        <GripVertical className="size-4 text-slate-400" />
        <span className="truncate text-sm font-semibold text-white">{list.name}</span>
        <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-slate-300">
          {count}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {Array.from({ length: Math.min(count, 3) }, (_, index) => (
          <div key={index} className="h-9 rounded-xl bg-white/6" />
        ))}
      </div>
    </div>
  );
}
