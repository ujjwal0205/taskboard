const GAP = 1024;

/**
 * The client-side twin of the backend's Positions.place: the position an item gets when dropped
 * at `index` among its ordered siblings. Used only for the optimistic update; the server's
 * answer replaces it.
 */
export function place(siblingPositions: number[], index: number): number {
  if (siblingPositions.length === 0) return GAP;

  const slot = Math.max(0, Math.min(index, siblingPositions.length));
  if (slot === 0) return siblingPositions[0] - GAP;
  if (slot === siblingPositions.length) return siblingPositions[siblingPositions.length - 1] + GAP;
  return (siblingPositions[slot - 1] + siblingPositions[slot]) / 2;
}
