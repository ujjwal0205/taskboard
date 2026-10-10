import { cn } from "@/lib/utils";

/** Decorative animated background: three drifting colour blobs under a faded grid. */
export function Aurora({ dim = false, className }: { dim?: boolean; className?: string }) {
  return (
    <div aria-hidden className={cn("aurora", dim && "aurora-dim", className)}>
      <span />
      <span />
      <span />
      <div className="grid-fade absolute inset-0" />
    </div>
  );
}
