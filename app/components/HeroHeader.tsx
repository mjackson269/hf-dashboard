"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useSummaryData } from "../hooks/useSummaryData";
import QuickReadPanel from "./QuickReadPanel";

export default function HeroHeader() {
  const [hydrated, setHydrated] = useState(false);
  const { data, isLoading } = useSummaryData();
  const [quickReadOpen, setQuickReadOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Extract snapshot safely
  const snapshot = data?.snapshot;

  // Snapshot is only valid when all values are real numbers
  const snapshotReady =
    hydrated &&
    !isLoading &&
    snapshot &&
    typeof snapshot === "object" &&
    typeof snapshot.muf === "number" &&
    typeof snapshot.sf === "number" &&
    typeof snapshot.kp === "number";

  // Fallback stays visible until snapshot is truly ready
  if (!snapshotReady) {
    return (
      <section className="relative mb-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 text-cyan-200">
          Loading live propagation snapshot…
        </div>
      </section>
    );
  }

  // Safe to use snapshot now
  const muf = snapshot.muf;
  const sf = snapshot.sf;
  const kp = snapshot.kp;
  const score = data.score ?? 0;

  return (
    <section className="relative mb-8">
      {/* Your full JSX goes here */}
      {/* Nothing else needs to change */}
    </section>
  );
}