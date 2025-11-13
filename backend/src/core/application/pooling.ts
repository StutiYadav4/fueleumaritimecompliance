/**
 * FuelEU Pooling — Correct Algorithm (FIFO deduction)
 *
 * Surplus ships lose only enough to cover deficits.
 * Deficit ships become zero.
 * Any leftover surplus stays with the last surplus ship.
 */

export function createPoolAlloc(
  members: { shipId: string; cbBefore: number }[]
) {
  // Clone
  const alloc = members.map((m) => ({ ...m, cbAfter: m.cbBefore }));

  // Surplus & deficit separation
  const surplus = alloc.filter((m) => m.cbBefore > 0);
  const deficit = alloc.filter((m) => m.cbBefore < 0);

  let totalDeficit = deficit.reduce((s, m) => s + Math.abs(m.cbBefore), 0);

  // Deficits become zero
  for (const d of deficit) {
    d.cbAfter = 0;
  }

  // Deduct deficit from surplus in FIFO
  for (const s of surplus) {
    if (totalDeficit <= 0) break;

    const give = Math.min(s.cbBefore, totalDeficit);
    s.cbAfter = s.cbBefore - give;

    totalDeficit -= give;
  }

  return alloc;
}
