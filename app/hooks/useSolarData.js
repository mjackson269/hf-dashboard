"use client";
import { useEffect, useState } from "react";

export function useSolarData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/current`
        );

        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}