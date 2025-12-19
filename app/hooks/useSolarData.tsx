"use client";

import { useEffect, useState } from "react";

export type SolarData = {
  solar: {
    sn: number;
    sfi: number;
    kp: number;
    ssnDescription: string;
    kpDescription: string;
  };
  bands: Array<{
    band: string;
    day: string;
    night: string;
    overall: string;
  }>;
  alerts: Array<{
    id: string;
    type: "info" | "warning" | "danger";
    message: string;
  }>;
  summary: {
    highlights: string[];
    recommendations: string[];
  };
};

type UseSolarDataResult = {
  data: SolarData | null;
  loading: boolean;
  error: string | null;
};

export function useSolarData(): UseSolarDataResult {
  const [data, setData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/current", { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = (await res.json()) as SolarData;

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load solar data";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}