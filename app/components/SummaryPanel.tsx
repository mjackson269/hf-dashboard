"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function AICommentaryPanel() {
  const { data, isLoading } = useSummaryData();
  const commentary = data?.commentary;

  if (isLoading || !commentary) {
    return <div className={card}>Loading commentary…</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>AI Propagation Commentary</h2>

      <div className="mt-3 space-y-3 text-sm text-neutral-300">
        <div>
          <strong className="text-slate-200">Quick Take:</strong>{" "}
          {commentary.quickTake}
        </div>

        {commentary.trendInsights?.length > 0 && (
          <div>
            <strong className="text-slate-200">Trend Insights:</strong>
            <ul className="list-disc ml-5 mt-1">
              {commentary.trendInsights.map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {commentary.bandNotes && (
          <div>
            <strong className="text-slate-200">Band Notes:</strong>
            <ul className="list-disc ml-5 mt-1">
              {Object.entries(commentary.bandNotes).map(([band, note]) => (
                <li key={band}>
                  <strong>{band}:</strong> {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {commentary.operatorAdvice && (
          <div>
            <strong className="text-slate-200">Operator Advice:</strong>{" "}
            {commentary.operatorAdvice}
          </div>
        )}
      </div>
    </div>
  );
}