"use client";

import { useEffect, useState } from "react";

export function useFt8Data(pollIntervalMs: number = 60000) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    async function fetchFt8() {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        const res = await fetch("/api/ft8", { cache: "no-store" });
        if (!res.ok) throw new Error(`FT8 fetch failed: ${res.status}`);

        const json = await res.json();
        if (!isMounted) return;

        setData(json);
        setIsError(null);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("FT8 polling error:", err);
        setIsError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFt8();
    timer = setInterval(fetchFt8, pollIntervalMs);

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [pollIntervalMs]);

  return { data, isLoading, isError };
}