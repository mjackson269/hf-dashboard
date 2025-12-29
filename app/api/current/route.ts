// app/api/current/route.ts

export async function GET() {
  // In a real app, fetch these from your data source.
  const data = {
    sfiEstimated: 145,
    sfiEstimatedPrev: 143,

    sfiAdjusted: 178,
    sfiAdjustedPrev: 178,

    kp: 2,
    kpPrev: 3,

    muf: 22.5,
    mufPrev: 21.8,
  };

  // -----------------------------
  // Rule‑based SNR from Kp index
  // -----------------------------
  function snrFromKp(kp: number) {
    if (kp <= 1) return 30;   // high SNR
    if (kp <= 3) return 20;   // moderate SNR
    return 10;                // poor SNR
  }

  const snr = snrFromKp(data.kp);

  // -----------------------------
  // Rule‑based MUF support per band
  // -----------------------------
  const bands = {
    "80m": {
      freq: 3.5,
      mufSupport: data.muf >= 3.5 ? "open" : "closed",
      snr,
    },
    "40m": {
      freq: 7,
      mufSupport: data.muf >= 7 ? "open" : "closed",
      snr,
    },
    "20m": {
      freq: 14,
      mufSupport: data.muf >= 14 ? "open" : "closed",
      snr,
    },
    "15m": {
      freq: 21,
      mufSupport: data.muf >= 21 ? "open" : "marginal",
      snr,
    },
    "10m": {
      freq: 28,
      mufSupport: data.muf >= 28 ? "open" : "closed",
      snr,
    },
  };

  // -----------------------------
  // Final response
  // -----------------------------
  return Response.json({
    ...data,
    bands,
  });
}