"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import { card, panelTitle } from "../lib/designSystem";

export default function CurrentHFConditionsPanel() {
  const { data, isLoading } = useSummaryData();
  const current = data?.current;

  const formatted =
    current?.timestamp && !Number.isNaN(Date.parse(current.timestamp))
      ? new Date(current.timestamp).toLocaleString("en-GB", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unavailable";

  return (
    <div className={card}>
      <h2 className={panelTitle}>Current HF Conditions</h2>

      {isLoading || !current ? (
        <div className="mt-3 text-sm text-neutral-400">Loading HF conditions…</div>
      ) : (
        <>
          <table className="w-full text-sm mt-3 border-collapse">
            <tbody>
              <tr>
                <td className="py-1 text-neutral-400">SFI</td>
                <td className="py-1 font-semibold text-slate-200">
                  {current.sfi ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-neutral-400">Kp Index</td>
                <td className="py-1 font-semibold text-slate-200">
                  {current.kp ?? "—"}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-neutral-400">MUF</td>
                <td className="py-1 font-semibold text-slate-200">
                  {current.muf ? `${current.muf} MHz` : "—"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-xs text-neutral-500 mt-2">Updated: {formatted}</div>
        </>
      )}
    </div>
  );
}