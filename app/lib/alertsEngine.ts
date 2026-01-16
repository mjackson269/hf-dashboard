export function generateDeterministicAlerts(current: any) {
  const alerts: any[] = [];

  const { kp, sfiEstimated, muf, bands } = current;

  // --- Geomagnetic Alerts ---
  if (kp >= 5) {
    alerts.push({
      type: `Geomagnetic Storm — Kp ${kp}`,
      description: "Storm-level geomagnetic activity. Expect HF degradation, especially on low bands.",
      severity: "high",
      issued: new Date().toISOString(),
    });
  } else if (kp >= 4) {
    alerts.push({
      type: `Geomagnetic Unsettled — Kp ${kp}`,
      description: "Unsettled geomagnetic field. Mid/high bands may fluctuate.",
      severity: "medium",
      issued: new Date().toISOString(),
    });
  }

  // --- MUF Alerts ---
  if (muf < 10) {
    alerts.push({
      type: "MUF Collapse",
      description: "Maximum usable frequency is low. High bands likely closed.",
      severity: "high",
      issued: new Date().toISOString(),
    });
  } else if (muf < 15) {
    alerts.push({
      type: "Low MUF",
      description: "High-band DX limited. 20m and below favoured.",
      severity: "medium",
      issued: new Date().toISOString(),
    });
  }

  // --- Band-Specific Alerts ---
  if (bands) {
  for (const [band, info] of Object.entries(
    bands as Record<string, { snr: number }>
  )) {
    if (info.snr < 10) {
      alerts.push({
        type: `${band} — High Noise Floor`,
        description: `${band} showing elevated noise. Expect reduced readability.`,
        severity: "medium",
        issued: new Date().toISOString(),
      });
    }
  }
}

      if (info.mufSupport === "closed") {
        alerts.push({
          type: `${band} Closed`,
          description: `${band} propagation closed due to insufficient MUF.`,
          severity: "low",
          issued: new Date().toISOString(),
        });
      }
    }
  }

  return alerts;
}