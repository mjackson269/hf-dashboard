"use client";

import React from "react";
import { card, panelTitle } from "../lib/designSystem";

interface BandTableProps {
  bands: Array<{
    band: string;
    snr: number;
    dx: number;
    noise: number;
    status?: string;
  }>;
}

export default function BandTable({ bands }: BandTableProps) {
  if (!bands || bands.length === 0) {
    return (
      <div className={card}>
        <h2 className={panelTitle}>Band Conditions</h2>
        <p className="text-neutral-400 text-sm mt-2">No band data available.</p>
      </div>
    );
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Band Conditions</h2>

      <table className="w-full mt-3 text-sm text-neutral-300">
        <thead>
          <tr className="text-neutral-400 border-b border-neutral-700">
            <th className="py-1 text-left">Band</th>
            <th className="py-1 text-left">SNR</th>
            <th className="py-1 text-left">DX</th>
            <th className="py-1 text-left">Noise</th>
            <th className="py-1 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {bands.map((row, idx) => (
            <tr key={idx} className="border-b border-neutral-800">
              <td className="py-1">{row.band}</td>
              <td className="py-1">{row.snr}</td>
              <td className="py-1">{row.dx}</td>
              <td className="py-1">{row.noise}</td>
              <td className="py-1">{row.status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}