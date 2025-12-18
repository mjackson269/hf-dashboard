export default function SummaryCard({ highlights, recommendations }) {
  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
      <h2 className="text-xl font-bold mb-2">Daily Summary</h2>

      <p className="font-semibold mb-2">{highlights.headline}</p>

      <p>
        <strong>Best Bands:</strong> {highlights.bestBands.join(", ")}
      </p>
      <p>
        <strong>Challenging Bands:</strong>{" "}
        {highlights.challengingBands.join(", ") || "None"}
      </p>

      <h3 className="font-semibold mt-3">Recommendations</h3>
      <ul className="list-disc ml-5 text-sm">
        {recommendations.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}