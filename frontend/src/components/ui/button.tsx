import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-900/30 hover:brightness-110",
  subtle: "bg-white/7 text-slate-100 border border-white/10 hover:bg-white/12",
  ghost: "text-slate-300 hover:bg-white/8 hover:text-white",
  danger: "bg-rose-500/15 text-rose-200 border border-rose-400/30 hover:bg-rose-500/25",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
