export function generateDeterministicAlerts(current: any) {
  const alerts: any[] = [];

  if (!current) return alerts;

  const { kp, sfiEstimated, bands } = current;

  // ---------------------------------------------------------
  // Kp-based alerts
  // ---------------------------------------------------------
  if (kp >= 5) {
    alerts.push({
      type: "Geomagnetic Storm",
      description: "Kp index at storm levels. Expect degraded HF conditions.",
      severity: "high",
      issued: new Date().toISOString(),
    });
  } else if (kp >= 4) {
    alerts.push({
      type: "Disturbed Conditions",
      description: "Kp index elevated. HF reliability may be reduced.",
      severity: "medium",
      issued: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // SFI-based alerts
  // ---------------------------------------------------------
  if (sfiEstimated < 80) {
    alerts.push({
      type: "Low Solar Flux",
      description: "SFI is low. Expect weaker MUF and reduced DX potential.",
      severity: "low",
      issued: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------
  // Band noise / SNR alerts
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Final return
  // ---------------------------------------------------------
  return alerts;
}