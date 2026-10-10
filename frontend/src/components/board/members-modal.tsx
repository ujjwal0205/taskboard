"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Crown, Eye, Mail, Pencil, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, errorMessage } from "@/lib/api";
import { memberSchema, type MemberValues } from "@/lib/schemas";
import type { Member, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleStyles: Record<Role, { label: string; icon: typeof Crown; className: string }> = {
  OWNER: { label: "Owner", icon: Crown, className: "bg-amber-400/15 text-amber-200 border-amber-300/30" },
  EDITOR: { label: "Editor", icon: Pencil, className: "bg-violet-400/15 text-violet-200 border-violet-300/30" },
  VIEWER: { label: "Viewer", icon: Eye, className: "bg-white/7 text-slate-300 border-white/15" },
};

export function RoleBadge({ role }: { role: Role }) {
  const { label, icon: Icon, className } = roleStyles[role];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", className)}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}

type MembersModalProps = {
  open: boolean;
  onClose: () => void;
  boardId: string;
  members: Member[];
  currentUserId: string;
  isOwner: boolean;
  onChanged: (members: Member[]) => void;
};

export function MembersModal({ open, onClose, boardId, members, currentUserId, isOwner, onChanged }: MembersModalProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MemberValues>({ resolver: zodResolver(memberSchema), defaultValues: { email: "", role: "EDITOR" } });

  const invite = handleSubmit(async (values) => {
    try {
      const member = await api<Member>(`/boards/${boardId}/members`, { method: "POST", body: values });
      onChanged([...members, member].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`${member.name} added as ${roleStyles[member.role].label.toLowerCase()}`);
      reset();
    } catch (error) {
      setError("root", { message: errorMessage(error) });
    }
  });

  const remove = async (member: Member) => {
    setRemoving(member.userId);
    try {
      await api(`/boards/${boardId}/members/${member.userId}`, { method: "DELETE" });
      onChanged(members.filter((other) => other.userId !== member.userId));
      toast.success(`${member.name} removed`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Board members"
      description={isOwner ? "Invite people who already have an account." : "Only the owner can change who is on this board."}
    >
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {members.map((member) => (
            <motion.li
              key={member.userId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 rounded-xl bg-white/4 px-3 py-2.5"
            >
              <Avatar id={member.userId} name={member.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {member.name}
                  {member.userId === currentUserId && <span className="ml-1.5 text-xs font-normal text-slate-500">(you)</span>}
                </p>
                <p className="truncate text-xs text-slate-400">{member.email}</p>
              </div>
              <RoleBadge role={member.role} />
              {isOwner && member.role !== "OWNER" && (
                <button
                  type="button"
                  onClick={() => remove(member)}
                  disabled={removing === member.userId}
                  aria-label={`Remove ${member.name}`}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-200 disabled:opacity-50"
                >
                  <X className="size-4" />
                </button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {isOwner && (
        <form onSubmit={invite} noValidate className="mt-6 space-y-3 border-t border-white/10 pt-5">
          <FormError message={errors.root?.message} />
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <Field label="Email" htmlFor="member-email" error={errors.email?.message}>
              <Input
                id="member-email"
                type="email"
                placeholder="teammate@example.com"
                icon={<Mail />}
                invalid={!!errors.email}
                {...register("email")}
              />
            </Field>
            <Field label="Role" htmlFor="member-role" error={errors.role?.message}>
              <Select id="member-role" {...register("role")}>
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </Field>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            <UserPlus className="size-4" />
            Add member
          </Button>
        </form>
      )}
    </Modal>
  );
}
