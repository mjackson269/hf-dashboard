"use client";

import { useForecastData } from "../hooks/useForecastData";

export default function ForecastPanel() {
  const { data, isLoading, isError } = useForecastData();

  if (isLoading) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Loading forecast…</div>;
  if (isError) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Error loading forecast.</div>;

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">24h Propagation Forecast</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-neutral-700">
            <th>Time</th>
            <th>SFI</th>
            <th>Kp</th>
            <th>MUF (MHz)</th>
          </tr>
        </thead>
        <tbody>
          {data.hours.map((hour: any, index: number) => (
            <tr key={index} className="border-b border-neutral-800">
              <td>{hour.time}</td>
              <td>{hour.SFI}</td>
              <td>{hour.Kp}</td>
              <td>{hour.MUF}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}