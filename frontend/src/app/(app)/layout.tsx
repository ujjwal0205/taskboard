"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { Avatar } from "@/components/ui/avatar";
import { Aurora } from "@/components/visuals/aurora";
import { Logo } from "@/components/visuals/logo";
import { authStore, useSession } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  // The page is always rendered, so Next.js can prerender and validate it. Until the session is
  // known (and while a signed-out visitor is being redirected) a loader covers it instead.
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col">
      <Aurora dim className="fixed" />

      <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/boards" className="rounded-lg transition hover:opacity-90">
            <Logo />
          </Link>
          {session && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-white">{session.user.name}</p>
                <p className="text-xs leading-tight text-slate-400">{session.user.email}</p>
              </div>
              <Avatar id={session.user.id} name={session.user.name} size="md" />
              <button
                type="button"
                onClick={() => authStore.set(null)}
                aria-label="Sign out"
                title="Sign out"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>

      {!session && (
        <div className="fixed inset-0 z-40 flex bg-(--bg)">
          <FullScreenLoader />
        </div>
      )}
    </div>
  );
}
