export function PlaceholderCard({
  brand,
  label,
}: {
  brand: string;
  label: string;
}) {
  return (
    <div className="block cursor-default">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-soft hairline-pattern flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent" />
        <p className="font-display text-3xl sm:text-4xl text-ink/25 text-center px-6 leading-tight">
          {brand}
        </p>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracked uppercase text-muted">{label}</p>
          <p className="text-sm mt-1 text-ink/50">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
