import { AlignLeft, CalendarDays } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import type { Card, Member, Priority } from "@/lib/types";
import { cn, formatDay } from "@/lib/utils";

export const priorityStyles: Record<Priority, { label: string; chip: string; bar: string }> = {
  HIGH: { label: "High", chip: "bg-rose-500/15 text-rose-200 border-rose-400/30", bar: "bg-rose-400" },
  MEDIUM: { label: "Medium", chip: "bg-amber-500/15 text-amber-200 border-amber-400/30", bar: "bg-amber-300" },
  LOW: { label: "Low", chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30", bar: "bg-emerald-400" },
};

type CardFaceProps = {
  card: Card;
  assignee?: Member;
  today: string | null;
  /** Rendered inside the drag overlay: lifted and slightly rotated. */
  lifted?: boolean;
  flash?: number;
};

/** The visual of a card, shared by the board and the drag overlay. */
export function CardFace({ card, assignee, today, lifted = false, flash = 0 }: CardFaceProps) {
  const priority = card.priority ? priorityStyles[card.priority] : null;
  const overdue = !!card.dueDate && !!today && card.dueDate < today;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-[#16162e] p-3 pl-4 text-left transition-colors",
        lifted
          ? "rotate-2 cursor-grabbing border-violet-300/60 shadow-2xl shadow-violet-950/70"
          : "border-white/10 shadow-md shadow-black/20 hover:border-white/25",
      )}
    >
      {priority && <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", priority.bar)} />}
      {flash > 0 && <span key={flash} aria-hidden className="flash-ring" />}

      <p className="break-words text-sm font-medium leading-snug text-slate-100">{card.title}</p>

      {(priority || card.dueDate || card.description || assignee) && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
          {priority && (
            <span className={cn("rounded-md border px-1.5 py-0.5 font-medium", priority.chip)}>{priority.label}</span>
          )}
          {card.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                overdue ? "bg-rose-500/15 text-rose-200" : "bg-white/6",
              )}
            >
              <CalendarDays className="size-3" />
              {formatDay(card.dueDate)}
            </span>
          )}
          {card.description && <AlignLeft className="size-3.5" aria-label="Has a description" />}
          {assignee && <Avatar id={assignee.userId} name={assignee.name} size="xs" className="ml-auto" />}
        </div>
      )}
    </div>
  );
}
