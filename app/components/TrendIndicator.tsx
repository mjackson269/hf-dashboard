export default function TrendIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === undefined || previous === null) {
    return null;
  }

  const diff = current - previous;

  if (diff > 0) {
    return <span className="text-green-400 text-xs font-bold">↑</span>;
  }

  if (diff < 0) {
    return <span className="text-red-400 text-xs font-bold">↓</span>;
  }

  return <span className="text-neutral-400 text-xs font-bold">→</span>;
}