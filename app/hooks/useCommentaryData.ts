"use client";

import { useEffect, useState } from "react";

export function useCommentaryData() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/commentary", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load commentary:", err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return { data, isLoading };
}