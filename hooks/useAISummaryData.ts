import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.text());

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