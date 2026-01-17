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

  // Safe, stable condition for rendering the real snapshot
  const shouldRenderSnapshot =
    hydrated &&
    !isLoading &&
    data?.snapshot;

  // Fallback stays visible until snapshot is truly ready
  if (!shouldRenderSnapshot) {
    return (
      <section className="relative mb-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 text-cyan-200">
          Loading live propagation snapshot…
        </div>
      </section>
    );
  }

  // Snapshot is now safe to use
  const muf = data.snapshot.muf;
  const sf = data.snapshot.sf;
  const kp = data.snapshot.kp;
  const score = data.score ?? 0;

  return (
    <section className="relative mb-8">
      {/* Your full existing JSX goes here */}
      {/* Nothing else needs to change */}
    </section>
  );
}