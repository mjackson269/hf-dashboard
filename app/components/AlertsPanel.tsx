"use client";

import { useAlertsData } from "../hooks/useAlertsData";

export default function AlertsPanel() {
  const { data, isLoading, isError } = useAlertsData();

  if (isLoading) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Loading alerts…</div>;
  if (isError) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Error loading alerts.</div>;

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">HF Propagation Alerts</h2>
      {data.active.length === 0 ? (
        <p className="text-sm text-neutral-400">No active alerts.</p>
      ) : (
        <ul className="space-y-3">
          {data.active.map((alert: any, index: number) => (
            <li key={index} className="border-l-4 pl-3 border-red-500 bg-neutral-800 p-3 rounded">
              <p className="font-semibold">{alert.type} — {alert.level}</p>
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-neutral-400">Issued: {new Date(alert.issued).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}