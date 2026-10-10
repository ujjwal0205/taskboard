import { MousePointerClick, RefreshCw, ShieldCheck } from "lucide-react";

import { Aurora } from "@/components/visuals/aurora";
import { HeroBoard } from "@/components/visuals/hero-board";
import { Logo } from "@/components/visuals/logo";

const highlights = [
  { icon: RefreshCw, text: "Every change appears live for the whole team" },
  { icon: MousePointerClick, text: "Drag cards and lists to plan in seconds" },
  { icon: ShieldCheck, text: "Owners, editors and viewers per board" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1">
      <Aurora />

      <section className="relative hidden flex-1 flex-col justify-between p-12 lg:flex">
        <Logo />
        <div>
          <HeroBoard />
          <h1 className="mt-14 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            Plan together, <span className="text-gradient">in real time.</span>
          </h1>
          <ul className="mt-6 space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="glass flex size-8 items-center justify-center rounded-lg">
                  <Icon className="size-4 text-cyan-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">Built with Spring Boot, Next.js and WebSockets.</p>
      </section>

      <main className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
