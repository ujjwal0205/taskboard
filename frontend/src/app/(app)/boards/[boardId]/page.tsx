import { Suspense } from "react";

import { BoardScreen, BoardSkeleton } from "@/components/board/board-screen";

// The board id is only known at request time, so it is read inside a Suspense boundary and the
// skeleton is what gets prerendered.
export default function BoardPage({ params }: PageProps<"/boards/[boardId]">) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      {params.then(({ boardId }) => (
        <BoardScreen boardId={boardId} />
      ))}
    </Suspense>
  );
}
