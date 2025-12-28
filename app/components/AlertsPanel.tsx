"use client";

import { card, panelTitle, badge, subtleText } from "../lib/designSystem";

export default function AlertsPanel() {
  // Replace with your real alerts fetch/hook
  const alerts = [
    {
      type: "Solar Flare — M-class",
      description: "Moderate solar flare detected. Possible HF disruption in polar regions.",
      issued: "22/12/2025, 18:00:00",
      severity: "high",
    },
    {
      type: "Geomagnetic Storm — G2",
      description: "Kp index elevated. Expect degraded conditions on 80m and 160m bands.",
      issued: "22/12/2025, 12:00:00",
      severity: "medium",
    },
  ];

  const severityColor = (level: string) =>
    level === "high"
      ? "bg-red-600"
      : level === "medium"
      ? "bg-yellow-600 text-black"
      : "bg-gray-600";

  return (
    <div className={card}>
      <h2 className={panelTitle}>HF Propagation Alerts</h2>

      <div className="space-y-4 text-sm">
        {alerts.map((alert, i) => (
          <div key={i} className="space-y-1">
            <span className={`${badge} ${severityColor(alert.severity)}`}>
              {alert.type}
            </span>

            <p>{alert.description}</p>

            <div className={subtleText}>Issued: {alert.issued}</div>
          </div>
        ))}
      </div>
    </div>
  );
}