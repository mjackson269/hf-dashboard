"use client";

import { useScoreData } from "../hooks/useScoreData";

export default function ScorePanel() {
  const { data, isLoading, isError } = useScoreData();

  if (isLoading) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Loading score…</div>;
  if (isError) return <div className="bg-neutral-900 text-white p-4 rounded-lg">Error loading score.</div>;

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Propagation Score</h2>
      <p className="text-3xl font-bold">{data.value} — {data.label}</p>
      <ul className="mt-2 text-sm">
        <li>SFI: {data.details.SFI}</li>
        <li>Kp: {data.details.Kp}</li>
        <li>MUF: {data.details.MUF} MHz</li>
      </ul>
    </div>
  );
}