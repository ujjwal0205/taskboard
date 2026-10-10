"use client";

import { MousePointer2 } from "lucide-react";
import { motion } from "motion/react";

const columns = [
  { name: "Backlog", accent: "bg-violet-400", cards: [64, 44] },
  { name: "In progress", accent: "bg-fuchsia-400", cards: [52] },
  { name: "Done", accent: "bg-cyan-400", cards: [40, 56] },
];

/** Animated mock of a shared board: a second user's cursor carries a card across the columns. */
export function HeroBoard() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none">
      <svg viewBox="0 0 400 400" className="absolute -inset-10 -z-10 size-[calc(100%+5rem)] opacity-70">
        <defs>
          <linearGradient id="orbit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" stopOpacity="0.7" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="200" r="170" stroke="url(#orbit)" strokeWidth="1" fill="none" strokeDasharray="3 9" />
          <circle cx="200" cy="30" r="4" fill="#c4b5fd" />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "200px 200px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="200" cy="200" r="130" stroke="url(#orbit)" strokeWidth="1" fill="none" />
          <circle cx="330" cy="200" r="3" fill="#67e8f9" />
        </motion.g>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative rounded-3xl p-4 shadow-2xl shadow-violet-950/50"
      >
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-400/80" />
          <span className="size-2.5 rounded-full bg-amber-300/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 h-2 w-24 rounded-full bg-white/15" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {columns.map((column, columnIndex) => (
            <div key={column.name} className="rounded-2xl bg-white/4 p-2.5">
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${column.accent}`} />
                <span className="text-[10px] font-medium text-slate-300">{column.name}</span>
              </div>
              <div className="flex min-h-36 flex-col gap-2">
                {column.cards.map((width, cardIndex) => (
                  <motion.div
                    key={cardIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + columnIndex * 0.12 + cardIndex * 0.08 }}
                    className="rounded-xl border border-white/10 bg-[#17172f] p-2.5"
                  >
                    <span className="block h-1.5 rounded-full bg-white/25" style={{ width: `${width}%` }} />
                    <span className="mt-1.5 block h-1.5 w-1/3 rounded-full bg-white/10" />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* The card being dragged by a collaborator. */}
        <motion.div
          className="absolute left-[7%] top-[62%] w-[26%]"
          animate={{ x: ["0%", "128%", "128%", "256%", "256%", "0%"], y: ["0%", "-70%", "-70%", "10%", "10%", "0%"], rotate: [0, 4, 0, 4, 0, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.85, 1] }}
        >
          <div className="rounded-xl border border-cyan-300/50 bg-[#1b1b38] p-2.5 shadow-xl shadow-cyan-500/20">
            <span className="block h-1.5 w-3/4 rounded-full bg-cyan-200/70" />
            <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-white/15" />
          </div>
          <div className="absolute -bottom-5 -right-3 flex items-center">
            <MousePointer2 className="size-4 fill-cyan-300 text-cyan-300" />
            <span className="ml-0.5 rounded-full bg-cyan-300 px-1.5 py-0.5 text-[9px] font-semibold text-slate-900">
              Rahul
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
