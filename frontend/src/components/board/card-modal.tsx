"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cardEditSchema, type CardEditValues } from "@/lib/schemas";
import type { Card, Member, Priority } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export type CardUpdate = {
  version: number;
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  priority: Priority | null;
};

type CardModalProps = {
  card: Card | undefined;
  listName?: string;
  members: Member[];
  canEdit: boolean;
  onClose: () => void;
  /** Resolves true when the save succeeded and the modal can close. */
  onSave: (cardId: string, update: CardUpdate) => Promise<boolean>;
  onDelete: (cardId: string) => Promise<void>;
};

export function CardModal({ card, listName, ...props }: CardModalProps) {
  return (
    <Modal
      open={!!card}
      onClose={props.onClose}
      title={props.canEdit ? "Edit card" : "Card details"}
      description={listName ? `In list “${listName}”` : undefined}
      className="sm:max-w-lg"
    >
      {card && <CardForm key={card.id} card={card} {...props} />}
    </Modal>
  );
}

const toValues = (card: Card): CardEditValues => ({
  title: card.title,
  description: card.description ?? "",
  assigneeId: card.assigneeId ?? "",
  dueDate: card.dueDate ?? "",
  priority: card.priority ?? "",
});

function CardForm({ card, members, canEdit, onClose, onSave, onDelete }: Omit<CardModalProps, "card" | "listName"> & { card: Card }) {
  // The copy of the card this form was filled from. Its version is what a save sends, so the
  // server can reject the save if someone else changed the card in the meantime.
  const [base, setBase] = useState(card);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CardEditValues>({ resolver: zodResolver(cardEditSchema), defaultValues: toValues(card) });

  const changedElsewhere = card.version !== base.version;

  const loadLatest = () => {
    setBase(card);
    reset(toValues(card));
  };

  const onSubmit = handleSubmit(async (values) => {
    const saved = await onSave(card.id, {
      version: base.version,
      title: values.title,
      description: values.description.trim() ? values.description : null,
      assigneeId: values.assigneeId || null,
      dueDate: values.dueDate || null,
      priority: values.priority || null,
    });
    if (saved) onClose();
  });

  const remove = async () => {
    setDeleting(true);
    try {
      await onDelete(card.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {changedElsewhere && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-2.5 text-sm text-cyan-100">
          <RefreshCw className="size-4 shrink-0" />
          <span className="flex-1">
            This card was changed by someone else{isDirty ? ". Loading the latest version discards your edits." : "."}
          </span>
          <Button variant="subtle" size="sm" onClick={loadLatest}>
            Load latest
          </Button>
        </div>
      )}

      <fieldset disabled={!canEdit} className="space-y-4">
        <Field label="Title" htmlFor="card-title" error={errors.title?.message}>
          <Input id="card-title" invalid={!!errors.title} {...register("title")} />
        </Field>

        <Field label="Description" htmlFor="card-description" error={errors.description?.message}>
          <Textarea
            id="card-description"
            rows={4}
            placeholder={canEdit ? "Add more detail…" : "No description"}
            invalid={!!errors.description}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Assignee" htmlFor="card-assignee" error={errors.assigneeId?.message}>
            <Select id="card-assignee" {...register("assigneeId")}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Priority" htmlFor="card-priority" error={errors.priority?.message}>
            <Select id="card-priority" {...register("priority")}>
              <option value="">None</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </Field>

          <Field label="Due date" htmlFor="card-due" error={errors.dueDate?.message}>
            <Input id="card-due" type="date" invalid={!!errors.dueDate} {...register("dueDate")} />
          </Field>
        </div>
      </fieldset>

      <p className="text-xs text-slate-500">
        Created {formatDateTime(card.createdAt)} · Updated {formatDateTime(card.updatedAt)} · v{card.version}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {canEdit &&
          (confirmingDelete ? (
            <>
              <Button variant="danger" loading={deleting} onClick={remove}>
                <Trash2 className="size-4" />
                Confirm delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Keep
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmingDelete(true)} className="text-rose-300 hover:text-rose-200">
              <Trash2 className="size-4" />
              Delete
            </Button>
          ))}
        <span className="flex-1" />
        <Button variant="ghost" onClick={onClose}>
          {canEdit ? "Cancel" : "Close"}
        </Button>
        {canEdit && (
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        )}
      </div>
    </form>
  );
}
