"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Crown, Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyBoardsArt } from "@/components/visuals/empty-boards";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/auth";
import { nameSchema, type NameValues } from "@/lib/schemas";
import type { BoardSummary } from "@/lib/types";
import { gradientFor } from "@/lib/utils";

const createdFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function BoardsPage() {
  const session = useSession();
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const signedIn = !!session;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    api<BoardSummary[]>("/boards")
      .then((result) => {
        if (!cancelled) setBoards(result);
      })
      .catch((error) => {
        if (!cancelled) setFailed(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Your <span className="text-gradient">boards</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">Boards you own and boards you have been invited to.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New board
        </Button>
      </div>

      <div className="mt-8">
        {failed ? (
          <p className="glass rounded-2xl p-6 text-sm text-rose-200">{failed}</p>
        ) : boards === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="shimmer h-40 rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass flex flex-col items-center rounded-3xl px-6 py-14 text-center"
          >
            <EmptyBoardsArt className="w-56" />
            <h2 className="mt-6 text-lg font-semibold text-white">No boards yet</h2>
            <p className="mt-1.5 max-w-xs text-sm text-slate-400">
              Create your first board to start organising work into lists and cards.
            </p>
            <Button className="mt-6" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Create a board
            </Button>
          </motion.div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board, index) => (
              <motion.li
                key={board.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/boards/${board.id}`}
                  className="glass group block overflow-hidden rounded-2xl transition-colors hover:border-white/25"
                >
                  <div className="relative h-20" style={{ background: gradientFor(board.id) }}>
                    <div className="grid-fade absolute inset-0 opacity-60" />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-white">{board.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        {board.ownerId === session?.user.id && (
                          <span className="inline-flex items-center gap-1 text-amber-200">
                            <Crown className="size-3" />
                            Owner ·
                          </span>
                        )}
                        Created {createdFormat.format(new Date(board.createdAt))}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <CreateBoardModal open={creating} onClose={() => setCreating(false)} />
    </main>
  );
}

function CreateBoardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: "" } });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const board = await api<BoardSummary>("/boards", { method: "POST", body: values });
      toast.success("Board created");
      close();
      router.push(`/boards/${board.id}`);
    } catch (error) {
      setError("name", { message: errorMessage(error) });
    }
  });

  return (
    <Modal open={open} onClose={close} title="Create a board" description="You will be its owner and can invite others.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Board name" htmlFor="board-name" error={errors.name?.message}>
          <Input
            id="board-name"
            autoFocus
            placeholder="e.g. Website redesign"
            invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create board
          </Button>
        </div>
      </form>
    </Modal>
  );
}
