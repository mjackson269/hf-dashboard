import React from "react";

interface BandData {
  band: string;
  muf: number;
  snr: number;
  score: number;
  status: string;
  notes: string;
}

interface BandTableProps {
  bands: BandData[];
}

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "excellent":
    case "good":
      return "bg-green-600 text-white";
    case "fair":
      return "bg-yellow-500 text-black";
    case "poor":
      return "bg-orange-600 text-white";
    case "closed":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export const BandTable: React.FC<BandTableProps> = ({ bands }) => {
  return (
    <div className="w-full rounded-lg bg-gray-900 p-4 shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Band Conditions</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-200">
          <thead>
            <tr className="bg-gray-800 text-gray-300 uppercase text-xs">
              <th className="px-3 py-2 text-left">Band</th>
              <th className="px-3 py-2 text-left">MUF</th>
              <th className="px-3 py-2 text-left">SNR</th>
              <th className="px-3 py-2 text-left">Score</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {bands.map((b) => (
              <tr
                key={b.band}
                className="border-b border-gray-700 hover:bg-gray-800 transition"
              >
                <td className="px-3 py-2 font-medium text-white">{b.band}</td>
                <td className="px-3 py-2">{b.muf.toFixed(1)}</td>
                <td className="px-3 py-2">{b.snr.toFixed(1)} dB</td>
                <td className="px-3 py-2">{b.score}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-300">{b.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};