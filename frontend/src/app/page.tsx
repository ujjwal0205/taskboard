"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullScreenLoader } from "@/components/full-screen-loader";
import { useSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session === undefined) return;
    router.replace(session ? "/boards" : "/login");
  }, [session, router]);

  return <FullScreenLoader />;
}
