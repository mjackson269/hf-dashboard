"use client";

import { ArrowRight } from "lucide-react";

export default function HeroHeader() {
  return (
    <section className="relative mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/80 shadow-xl">

        {/* --- Atmospheric Glow Layers --- */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.16),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.75),rgba(0,0,0,0.95))]" />
        </div>

        {/* --- World Map Silhouette --- */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-[url('/world-map.svg')]
            bg-contain
            bg-center
            bg-no-repeat
            opacity-[0.12]
            mix-blend-screen
          "
        />

        {/* --- Scanline Texture --- */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_2px] opacity-20" />

        {/* --- Main Content --- */}
        <div className="relative z-10 flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-8">

          {/* Left Column */}
          <div className="max-w-xl space-y-3 md:space-y-4">

            {/* DX Operator Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-black/60 px-3 py-1 text-xs font-medium tracking-wide text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.4)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="uppercase text-[0.7rem]">DX-Operator Console</span>
              <span className="h-3 w-px bg-cyan-500/40" />
              <span className="text-[0.7rem] text-cyan-200/80">HF Propagation · Live Intelligence Feed</span>
            </div>

            {/* Title + Subtitle */}
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-sky-50 sm:text-3xl md:text-4xl">
                HF conditions, decoded for{" "}
                <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  operators
                </span>
                —not spreadsheets.
              </h1>

              <p className="max-w-xl text-sm text-slate-200/80 sm:text-[0.92rem]">
                One glance tells you whether to call CQ, chase DX, or stand down. No solar physics degree required.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 text-[0.72rem] text-slate-300/80">
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-500/10 text-[0.6rem] text-emerald-300">
                  ✓
                </span>
                <span>Scored, summarised, and ranked for HF DX</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-md border border-sky-500/35 bg-sky-950/30 px-2.5 py-1">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-sky-500/10 text-[0.6rem] text-sky-300">
                  ≈
                </span>
                <span>UK‑centric view: built around your latitude</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="mt-4 flex w-full flex-col gap-3 md:mt-0 md:w-72">

            {/* Live Propagation Snapshot */}
            <div className="rounded-xl border border-cyan-500/40 bg-black/60 px-4 py-3 shadow-[0_0_35px_rgba(34,211,238,0.35)]">
              <div className="mb-1 flex items-center justify-between text-[0.7rem] text-cyan-100/90">
                <span className="uppercase tracking-[0.16em] text-cyan-200/90">Live Propagation Snapshot</span>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[0.65rem] text-cyan-100">
                  Auto‑refreshed
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[0.7rem] tracking-wide text-cyan-200/80">UK‑Weighted Score</span>
                  <span className="mt-0.5 text-3xl font-semibold tracking-tight text-cyan-100">
                    7.4
                    <span className="ml-1 text-xs font-medium text-emerald-300/90 align-middle">
                      • Good / DX‑favourable
                    </span>
                  </span>
                </div>

                <div className="text-right text-[0.7rem] text-cyan-200/75">
                  <div className="flex items-center justify-end gap-1">
                    <span className="h-1.5 w-10 overflow-hidden rounded-full bg-cyan-500/20">
                      <span className="block h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                    </span>
                    <span>↑ trending</span>
                  </div>
                  <div className="mt-1 text-[0.65rem] text-cyan-100/70">Last 90 minutes improving</div>
                </div>
              </div>
            </div>

            {/* Quick Read Button */}
            <button className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-700/80 bg-slate-950/60 px-3.5 py-2 text-[0.78rem] text-slate-100 shadow-lg shadow-black/40 transition hover:border-cyan-400/70 hover:bg-slate-900/80 hover:text-cyan-50">
              <div className="flex flex-col text-left">
                <span className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                  Quick Read
                </span>
                <span className="text-[0.8rem] text-slate-100/95">
                  See best bands, risk factors, and recommended moves for the next 2–3 hours.
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-cyan-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}