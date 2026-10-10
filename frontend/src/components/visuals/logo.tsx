import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={cn("size-9", className)}>
      <defs>
        <linearGradient id="logo-fill" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="0.55" stopColor="#d946ef" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#logo-fill)" />
      <rect x="8.5" y="9" width="6" height="22" rx="2.2" fill="white" fillOpacity="0.95" />
      <rect x="17" y="9" width="6" height="14" rx="2.2" fill="white" fillOpacity="0.8" />
      <rect x="25.5" y="9" width="6" height="18" rx="2.2" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-white">
        Task<span className="text-gradient">board</span>
      </span>
    </span>
  );
}
