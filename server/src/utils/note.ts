export function normalizeTitle(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max));
}
