"use client";

import { useSummaryData } from "../hooks/useSummaryData";
import ReactMarkdown from "react-markdown";
import { card, panelTitle, bodyText } from "../lib/designSystem";

export default function SummaryPanel() {
  const { data, isLoading, isError } = useSummaryData();

  if (isLoading) {
    return <div className={card}>Loading summary…</div>;
  }

  if (isError || !data) {
    return <div className={card}>Error loading summary.</div>;
  }

  return (
    <div className={card}>
      <h2 className={panelTitle}>Daily HF Summary</h2>

      <div className={bodyText}>
        <ReactMarkdown>{data.markdown}</ReactMarkdown>
      </div>
    </div>
  );
}