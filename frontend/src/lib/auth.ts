"use client";

import { useSyncExternalStore } from "react";

import type { AuthResponse } from "./types";

export type Session = AuthResponse;

const STORAGE_KEY = "taskboard.session";

let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function load(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

// A tiny external store over localStorage, so every component sees login and logout immediately.
export const authStore = {
  get(): Session | null {
    if (cached === undefined) {
      cached = load();
    }
    return cached;
  },

  set(session: Session | null) {
    cached = session;
    try {
      if (session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage can be unavailable (private mode); the in-memory session still works for this tab.
    }
    emit();
  },

  subscribe(listener: () => void) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        cached = load();
        listener();
      }
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};

const serverSnapshot = () => undefined;

/** `undefined` while the page is still hydrating, `null` when signed out. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(authStore.subscribe, authStore.get, serverSnapshot);
}
