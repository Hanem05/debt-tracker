const PALETTE: [string, string][] = [
  ['#22d3ee', '#0a0a0f'], ['#a78bfa', '#0a0a0f'],
  ['#f97316', '#0a0a0f'], ['#4ade80', '#0a0a0f'],
  ['#fbbf24', '#0a0a0f'], ['#f87171', '#0a0a0f'],
  ['#34d399', '#0a0a0f'], ['#60a5fa', '#0a0a0f'],
  ['#e879f9', '#0a0a0f'], ['#fb923c', '#0a0a0f'],
];

export function getAvatarColor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
