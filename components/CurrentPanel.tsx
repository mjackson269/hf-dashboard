"use client";

import { useCurrentData } from "@/hooks/useCurrentData";

export default function CurrentPanel() {
  const { data, isLoading, isError } = useCurrentData();

  if (isLoading) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Loading current conditions…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-neutral-900 text-white p-4 rounded-lg">
        Error loading current data.
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Current HF Conditions</h2>
      <p>{data.message}</p>
    </div>
  );
}