"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import type { cardTitleSchema, TextValue } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type InlineComposerProps = {
  schema: typeof cardTitleSchema;
  openLabel: string;
  submitLabel: string;
  placeholder: string;
  onSubmit: (value: string) => Promise<void>;
  className?: string;
};

/** A "+ Add ..." button that expands into a one-field form and stays open for rapid entry. */
export function InlineComposer({ schema, openLabel, submitLabel, placeholder, onSubmit, className }: InlineComposerProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<TextValue>({ resolver: zodResolver(schema), defaultValues: { value: "" } });

  const close = () => {
    reset();
    setOpen(false);
  };

  const submit = handleSubmit(async ({ value }) => {
    await onSubmit(value);
    reset();
    setFocus("value");
  });

  const error = errors.value?.message;

  return (
    <div className={className}>
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onSubmit={submit}
            noValidate
          >
            <textarea
              autoFocus
              rows={2}
              placeholder={placeholder}
              aria-label={placeholder}
              aria-invalid={error ? true : undefined}
              className={cn(controlClass, "resize-none py-2")}
              {...register("value")}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
                if (event.key === "Escape") {
                  event.stopPropagation();
                  close();
                }
              }}
            />
            {error && (
              <p role="alert" className="pt-1 text-xs text-rose-300">
                {error}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <Button type="submit" size="sm" loading={isSubmitting}>
                {submitLabel}
              </Button>
              <button
                type="button"
                onClick={close}
                aria-label="Cancel"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-slate-400 transition hover:bg-white/7 hover:text-white"
          >
            <Plus className="size-4" />
            {openLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
