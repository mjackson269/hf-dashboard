"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function CurrentConditionsPanel() {
  const { data, isLoading } = useSummaryData();

  if (isLoading) return <div className={card}>Loading current HF conditions…</div>;
  if (!data) return <div className={card}>Current conditions unavailable.</div>;

  const { sfiEstimated, kp, muf, bands } = data;

  const best = Object.entries(bands).sort(
    (a: any, b: any) => b[1].dx - a[1].dx
  )[0] as any;

  return (
    <div className={card}>
      <h2 className={panelTitle}>Current HF Conditions</h2>
      <p className="mt-2 text-neutral-300">
        <strong className="text-white">SFI:</strong> {sfiEstimated.toFixed(1)} |{" "}
        <strong className="text-white">Kp:</strong> {kp} |{" "}
        <strong className="text-white">MUF (F2, est):</strong> {muf.toFixed(1)} MHz
      </p>
      {best && (
        <p className="mt-2 text-neutral-300">
          <strong className="text-white">Best band now:</strong> {best[0]} with{" "}
          {best[1].dx}% DX probability (SNR {best[1].snr} dB, absorption{" "}
          {best[1].absorption} dB).
        </p>
      )}
    </div>
  );
}