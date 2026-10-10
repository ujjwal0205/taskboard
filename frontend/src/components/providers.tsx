"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(18 18 42 / 0.92)",
            border: "1px solid rgb(255 255 255 / 0.12)",
            color: "#e7e7f4",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </MotionConfig>
  );
}
