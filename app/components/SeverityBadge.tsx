export default function SeverityBadge({ severity }: { severity: string }) {
  const normalized = (severity || "").trim().toLowerCase();

  const styles =
    normalized === "improving"
      ? "bg-green-400 text-black"
      : normalized === "degrading"
      ? "bg-red-500 text-white"
      : "bg-yellow-300 text-black";

  const label =
    normalized === "improving"
      ? "Improving"
      : normalized === "degrading"
      ? "Degrading"
      : "Stable";

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${styles}`}>
      {label}
    </span>
  );
}