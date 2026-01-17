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

  // Prevent server/client mismatch
  if (!hydrated || isLoading || !data || !data.snapshot) {
    return (
      <section className="relative mb-8">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 text-cyan-200">
          Loading live propagation snapshot…
        </div>
      </section>
    );
  }

  const muf = data.snapshot.muf;
  const sf = data.snapshot.sf;
  const kp = data.snapshot.kp;
  const score = data.score ?? 0;

  return (
    <section className="relative mb-8">
      {/* ... your entire existing JSX unchanged ... */}
    </section>
  );
}