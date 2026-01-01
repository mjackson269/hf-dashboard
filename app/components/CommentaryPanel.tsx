"use client";

type Commentary = {
  quickTake: string;
  trendInsights: string[];
  bandNotes: Record<string, string>;
  advice: string;
  generatedAt?: string; // optional timestamp from your AI call
};

export default function CommentaryPanel({ commentary }: { commentary: Commentary }) {
  const timestamp =
    commentary.generatedAt ??
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Band colour accents (same mapping as Status Bar)
  const bandColor = (band: string) => {
    if (band.includes("10")) return "text-green-400";
    if (band.includes("12")) return "text-emerald-400";
    if (band.includes("15")) return "text-blue-400";
    if (band.includes("17")) return "text-indigo-400";
    if (band.includes("20")) return "text-purple-400";
    if (band.includes("30")) return "text-yellow-300";
    return "text-neutral-300";
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-5 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">📡</span>
          <h2 className="text-lg font-semibold text-white">AI Propagation Commentary</h2>
        </div>
        <span className="text-xs text-neutral-500">Generated at {timestamp}</span>
      </div>

      <div className="border-t border-neutral-800" />

      {/* Quick Take */}
      <div className="bg-blue-950/40 border border-blue-700/40 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-1">Quick Take</h3>
        <p className="text-blue-100">
          {commentary.quickTake || "No quick summary available."}
        </p>
      </div>

      {/* Trend Insights */}
      <div>
        <h3 className="text-neutral-300 font-semibold mb-2">Trend Insights</h3>

        {commentary.trendInsights?.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-neutral-200">
            {commentary.trendInsights.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 text-sm">No trend insights available.</p>
        )}
      </div>

      <div className="border-t border-neutral-800" />

      {/* Band Notes */}
      <div>
        <h3 className="text-neutral-300 font-semibold mb-2">Band Notes</h3>

        {Object.keys(commentary.bandNotes ?? {}).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(commentary.bandNotes).map(([band, note]) => (
              <div
                key={band}
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-3"
              >
                <p className={`font-semibold mb-1 ${bandColor(band)}`}>{band}</p>
                <p className="text-neutral-200">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">No band-specific notes available.</p>
        )}
      </div>

      <div className="border-t border-neutral-800" />

      {/* Operator Advice */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h3 className="text-neutral-300 font-semibold mb-1">Operator Advice</h3>
        <p className="text-neutral-200">
          {commentary.advice || "No operator advice available."}
        </p>
      </div>
    </div>
  );
}