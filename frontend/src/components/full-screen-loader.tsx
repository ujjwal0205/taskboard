import { LogoMark } from "@/components/visuals/logo";

export function FullScreenLoader() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-1 items-center justify-center">
      <LogoMark className="size-12 animate-pulse" />
    </div>
  );
}
