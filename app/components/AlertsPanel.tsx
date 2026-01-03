"use client";

import { useEffect, useState } from "react";
import { card, panelTitle, badge, subtleText } from "../lib/designSystem";

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch("/api/commentary", { cache: "no-store" });
        const json = await res.json();
        setAlerts(json.alerts || []);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  const severityColor = (level: string) =>
    level === "high"
      ? "bg-red-600"
      : level === "medium"
      ? "bg-yellow-600 text-black"
      : "bg-gray-600";

  return (
    <div className={card}>
      <h2 className={panelTitle}>HF Propagation Alerts</h2>

      {/* Loading State */}
      {loading && (
        <div className="text-sm text-neutral-400">Loading alerts…</div>
      )}

      {/* No Alerts */}
      {!loading && alerts.length === 0 && (
        <div className="text-sm text-neutral-400">
          No active HF propagation alerts.
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4 text-sm">
        {alerts.map((alert, i) => (
          <div key={i} className="space-y-1">
            <span className={`${badge} ${severityColor(alert.severity)}`}>
              {alert.type}
            </span>

            <p>{alert.description}</p>

            <div className={subtleText}>
              Issued:{" "}
              {alert.issued
                ? new Date(alert.issued).toLocaleString()
                : "Unknown"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}