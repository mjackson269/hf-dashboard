"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

const bands = ["80m", "40m", "20m", "15m", "10m"];

export default function BandsTable() {
  const { data, isLoading } = useSummaryData();

  const current = data?.current;
  const bandData = current?.bands;

  if (isLoading) {
    return <div className={card}>Loading band data…</div>;
  }

  if (!bandData) {
    return <div className={card}>No band data available.</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Band Conditions</h2>

      <table className="w-full text-sm mt-3 border-collapse">
        <thead className="text-neutral-400">
          <tr>
            <th className="text-left py-1">Band</th>
            <th className="text-left py-1">SNR (dB)</th>
            <th className="text-left py-1">Absorption (dB)</th>
            <th className="text-left py-1">DX (%)</th>
          </tr>
        </thead>

        <tbody>
          {bands.map((band) => {
            const b = bandData[band];

            if (!b) {
              return (
                <tr key={band} className="border-t border-neutral-800">
                  <td className="py-1">{band}</td>
                  <td colSpan={3} className="py-1 text-neutral-500">
                    No data
                  </td>
                </tr>
              );
            }

            const snrColor =
              b.snr >= 30
                ? "text-emerald-400"
                : b.snr >= 20
                ? "text-cyan-300"
                : b.snr >= 10
                ? "text-yellow-300"
                : "text-red-400";

            const dxColor =
              b.dx >= 70
                ? "text-emerald-400"
                : b.dx >= 40
                ? "text-cyan-300"
                : b.dx >= 20
                ? "text-yellow-300"
                : "text-red-400";

            return (
              <tr key={band} className="border-t border-neutral-800">
                <td className="py-1">{band}</td>
                <td className={`py-1 font-semibold ${snrColor}`}>{b.snr}</td>
                <td className="py-1 text-neutral-300">{b.absorption}</td>
                <td className={`py-1 font-semibold ${dxColor}`}>{b.dx}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}