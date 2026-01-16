"use client";

import React from "react";
import SeverityBadge from "./SeverityBadge";
import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function SummaryPanel() {
  const { data, isLoading } = useSummaryData();

  if (isLoading || !data) {
    return <div className={card}>Loading summary…</div>;
  }

  const commentary = data.commentary;

  if (!commentary) {
    return <div className={card}>No commentary available.</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Propagation Summary</h2>

      {/* Quick Take */}
      <div className="mt-2 text-sm text-neutral-300">
        <SeverityBadge severity={commentary.severity} />{" "}
        {commentary.quickTake}
      </div>

      {/* Trend Insights */}
      {Array.isArray(commentary.trendInsights) &&
        commentary.trendInsights.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-neutral-200 text-sm">
              Trend Insights
            </h3>
            <ul className="list-disc ml-5 mt-1 text-neutral-400 text-sm">
              {commentary.trendInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Band Notes */}
      {commentary.bandNotes &&
        Object.keys(commentary.bandNotes).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-neutral-200 text-sm">
              Band Notes
            </h3>
            <ul className="list-disc ml-5 mt-1 text-neutral-400 text-sm">
              {Object.entries(
                commentary.bandNotes as Record<string, string>
              ).map(([band, note]) => (
                <li key={band}>
                  <strong>{band}:</strong> {note}
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Advice */}
      {commentary.advice && (
        <div className="mt-4">
          <h3 className="font-semibold text-neutral-200 text-sm">Advice</h3>
          <p className="text-neutral-400 text-sm mt-1">
            {commentary.advice}
          </p>
        </div>
      )}

      {/* Alerts */}
      {Array.isArray(commentary.alerts) &&
        commentary.alerts.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-neutral-200 text-sm">
              Alerts
            </h3>
            <ul className="list-disc ml-5 mt-1 text-neutral-400 text-sm">
              {commentary.alerts.map((alert, idx) => (
                <li key={idx}>
                  <strong>{alert.type}:</strong> {alert.description} (
                  {alert.severity})
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}