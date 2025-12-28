"use client";

import { card, panelTitle } from "../styles/designSystem";

export default function ForecastPanel() {
  // Replace with your real forecast data
  const forecast = [
    { time: "00:00", sfi: 145, kp: 2, muf: 22.5 },
    { time: "06:00", sfi: 147, kp: 3, muf: 21.8 },
    { time: "12:00", sfi: 150, kp: 4, muf: 20.2 },
    { time: "18:00", sfi: 148, kp: 3, muf: 19.5 },
    { time: "00:00", sfi: 146, kp: 2, muf: 21.0 },
  ];

  return (
    <div className={card}>
      <h2 className={panelTitle}>24h Propagation Forecast</h2>

      <table className="w-full text-sm border-collapse">
        <thead className="text-neutral-400">
          <tr>
            <th className="text-left py-1">Time</th>
            <th className="text-left py-1">SFI</th>
            <th className="text-left py-1">Kp</th>
            <th className="text-left py-1">MUF (MHz)</th>
          </tr>
        </thead>

        <tbody>
          {forecast.map((row, i) => (
            <tr key={i} className="border-t border-neutral-800">
              <td className="py-1">{row.time}</td>
              <td className="py-1">{row.sfi}</td>
              <td className="py-1">{row.kp}</td>
              <td className="py-1">{row.muf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}