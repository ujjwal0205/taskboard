import { cn, gradientFor, initials } from "@/lib/utils";

const sizes = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
};

type AvatarProps = { id: string; name: string; size?: keyof typeof sizes; className?: string };

export function Avatar({ id, name, size = "sm", className }: AvatarProps) {
  return (
    <span
      title={name}
      style={{ background: gradientFor(id) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-[#0d0d1f]",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
