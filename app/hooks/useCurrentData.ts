"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCurrentData() {
  const { data, error, isLoading } = useSWR("/api/current", fetcher);

  return {
    data,
    isLoading,
    isError: !!error,
  };
}