"use client";

import { card, panelTitle } from "../lib/designSystem";
import { useSummaryData } from "../hooks/useSummaryData";

export default function BandTable() {
  const { data, isLoading } = useSummaryData();

  if (isLoading) return <div className={card}>Loading band data…</div>;
  if (!data || !data.bands) return <div className={card}>No band data.</div>;

  const entries = Object.entries(data.bands) as [string, any][];

  return (
    <div className={card}>
      <h2 className={panelTitle}>Band Data</h2>
      <table className="mt-3 w-full text-sm text-neutral-300">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="text-left py-1">Band</th>
            <th className="text-left py-1">DX (%)</th>
            <th className="text-left py-1">SNR (dB)</th>
            <th className="text-left py-1">Absorption (dB)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([band, b]) => {
            const dxColor =
              b.dx >= 70
                ? "text-emerald-400"
                : b.dx >= 40
                ? "text-amber-400"
                : b.dx >= 20
                ? "text-red-400"
                : "text-neutral-500";

            return (
              <tr key={band} className="border-b border-neutral-900">
                <td className="py-1 text-neutral-200">{band}</td>
                <td className={`py-1 font-semibold ${dxColor}`}>{b.dx}%</td>
                <td className="py-1">{b.snr}</td>
                <td className="py-1">{b.absorption}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}