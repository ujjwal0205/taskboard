"use client";

import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export const controlClass = cn(
  "w-full rounded-xl border bg-white/4 px-3.5 text-sm text-white placeholder:text-slate-500",
  "outline-none transition duration-200",
  "border-white/10 hover:border-white/20 focus:border-violet-400/70 focus:bg-white/7 focus:ring-4 focus:ring-violet-500/15",
  "aria-invalid:border-rose-400/70 aria-invalid:focus:ring-rose-500/15",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

/** A label, its control, and an animated validation message. */
export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-slate-300">
        {label}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden pt-1.5 text-xs text-rose-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

type InputProps = React.ComponentProps<"input"> & { icon?: React.ReactNode; invalid?: boolean };

export function Input({ icon, invalid, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 [&>svg]:size-4">
          {icon}
        </span>
      )}
      <input aria-invalid={invalid || undefined} className={cn(controlClass, "h-11", icon && "pl-10", className)} {...props} />
    </div>
  );
}

type TextareaProps = React.ComponentProps<"textarea"> & { invalid?: boolean };

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlClass, "scroll-thin resize-none py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

type SelectProps = React.ComponentProps<"select"> & { invalid?: boolean };

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(controlClass, "h-11 appearance-none [&>option]:bg-[#12122a]", className)}
      {...props}
    >
      {children}
    </select>
  );
}
