export default function BandsTable({ bands }) {
  const colour = score =>
    score >= 70 ? "🟢" : score >= 40 ? "🟡" : "🔴";

  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
      <h2 className="text-xl font-bold mb-2">Band Conditions</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-700">
            <th className="text-left py-1">Band</th>
            <th className="text-left py-1">Freq</th>
            <th className="text-left py-1">Score</th>
            <th className="text-left py-1">Category</th>
            <th className="text-left py-1">Colour</th>
          </tr>
        </thead>

        <tbody>
          {bands.map((b, i) => (
            <tr
              key={i}
              className="border-b border-slate-300 dark:border-slate-700"
            >
              <td className="py-1">{b.band}</td>
              <td className="py-1">{b.frequencyMHz} MHz</td>
              <td className="py-1">{b.score}</td>
              <td className="py-1">{b.category}</td>
              <td className="py-1">{colour(b.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}