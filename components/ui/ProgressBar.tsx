'use client';

interface ProgressBarProps {
  pct: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ pct, color = '#38bdf8', height = 6, showLabel }: ProgressBarProps) {
  const normalized = Math.min(100, Math.max(0, pct));

  return (
    <div className="space-y-1.5 text-sm text-text/60">
      <div className="overflow-hidden rounded-full bg-white/[0.06]" style={{ height }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${normalized}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      {showLabel ? <div className="text-xs">{normalized}% repaid</div> : null}
    </div>
  );
}
