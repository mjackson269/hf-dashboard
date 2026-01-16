"use client";

import React from "react";

interface CommentaryPanelProps {
  commentary: any; // or a proper type if you want to tighten it later
}

export default function CommentaryPanel({ commentary }: CommentaryPanelProps) {
  if (!commentary) return null;

  return (
    <div className="...">
      {/* your existing JSX */}
    </div>
  );
}



  const {
    quickTake,
    trendInsights = [],
    bandNotes = {},
    advice,
    alerts = [],
  } = data;

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Commentary</h2>

      {/* Quick Take */}
      {quickTake && (
        <p className="text-lg font-semibold text-white mt-2">{quickTake}</p>
      )}

      {/* Trend Insights */}
      {trendInsights.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-neutral-200 mb-1">Trend Insights</h3>
          <ul className="list-disc list-inside text-neutral-300 space-y-1">
            {trendInsights.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Band Notes */}
      {Object.keys(bandNotes).length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-neutral-200 mb-1">Band Notes</h3>
          <ul className="list-disc list-inside text-neutral-300 space-y-1">
            {Object.entries(bandNotes).map(([band, note]: any) => (
              <li key={band}>
                <strong className="text-white">{band}:</strong> {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div className="mt-4">
          <h3 className="font-semibold text-neutral-200 mb-1">Operator Advice</h3>
          <p className="text-neutral-300">{advice}</p>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-neutral-200 mb-1">Alerts</h3>
          <ul className="list-disc list-inside text-neutral-300 space-y-1">
            {alerts.map((alert: any, idx: number) => (
              <li key={idx}>
                <strong className="text-white">{alert.type}:</strong>{" "}
                {alert.description}{" "}
                <span className="text-neutral-400">
                  ({alert.severity} severity)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}