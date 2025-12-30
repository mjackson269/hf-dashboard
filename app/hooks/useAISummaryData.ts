import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const raw = await res.text();

  try {
    return JSON.parse(raw);
  } catch {
    console.error("AI Summary returned non‑JSON:", raw.slice(0, 200));
    return null;
  }
};

export function useAISummaryData() {
  const { data, error, isLoading } = useSWR("/api/ai-summary", fetcher, {
    refreshInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });

  return {
    data,
    isLoading,
    isError: error,
  };
}