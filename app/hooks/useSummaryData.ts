"use client";

import { useEffect, useState } from "react";

export function useSummaryData() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/summary", { cache: "no-store" });
        const json = await res.json();

        if (!cancelled) {
          setData(json);       // IMPORTANT
          setIsLoading(false); // IMPORTANT
        }
      } catch (err) {
        console.error("useSummaryData error:", err);
        if (!cancelled) {
          setData(null);
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true };
  }, []);

  return { data, isLoading };
}