"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useScoreData() {
  const { data, error, isLoading } = useSWR("/api/score", fetcher);

  return {
    data,
    isLoading,
    isError: !!error,
  };
}