"use client";

type Commentary = {
  quickTake: string;
  trendInsights: string[];
  bandNotes: Record<string, string>;
  advice: string;
};

export default function CommentaryPanel({ commentary }: { commentary: Commentary }) {
  return (
    <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-5 space-y-5">
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-blue-400 text-xl">📡</span>
        <h2 className="text-lg font-semibold text-white">AI Propagation Commentary</h2>
      </div>

      {/* Quick Take */}
      <div className="bg-blue-950/40 border border-blue-700/40 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-1">Quick Take</h3>
        <p className="text-blue-100">{commentary.quickTake}</p>
      </div>

      {/* Trend Insights */}
      <div>
        <h3 className="text-neutral-300 font-semibold mb-2">Trend Insights</h3>
        <ul className="list-disc list-inside space-y-1 text-neutral-200">
          {(commentary.trendInsights ?? []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Band Notes */}
      <div>
        <h3 className="text-neutral-300 font-semibold mb-2">Band Notes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(commentary.bandNotes ?? {}).map(([band, note]) => (
            <div
              key={band}
              className="bg-neutral-800 border border-neutral-700 rounded-lg p-3"
            >
              <p className="text-neutral-400 font-semibold mb-1">{band}</p>
              <p className="text-neutral-200">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Advice */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h3 className="text-neutral-300 font-semibold mb-1">Operator Advice</h3>
        <p className="text-neutral-200">{commentary.advice}</p>
      </div>
    </div>
  );
}