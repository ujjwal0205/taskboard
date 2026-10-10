"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

const readToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const noToday = () => null;

/** Today's local date as `YYYY-MM-DD`, or null during server rendering. */
export function useToday(): string | null {
  return useSyncExternalStore(noopSubscribe, readToday, noToday);
}
