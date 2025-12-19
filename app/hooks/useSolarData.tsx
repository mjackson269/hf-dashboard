"use client";

import { useSolarData } from "./hooks/useSolarData.tsx";
import type { SolarData } from "./hooks/useSolarData.tsx";

import SolarCard from "./components/SolarCard";
import BandsTable from "./components/BandsTable";
import ForecastTable from "./components/ForecastTable";
import AlertsCard from "./components/AlertsCard";
import SummaryCard from "./components/SummaryCard";

export default function Page() {
  // ✅ Explicitly assert the hook return type to stop TS inferring `never`
  const { data, loading, error } = useSolarData() as {
    data: SolarData | null;
    loading: boolean;
    error: string | null;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-32" />
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-48" />
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-24" />
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading data: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-yellow-600 dark:text-yellow-400">
        No data available.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SolarCard solar={data.solar} />
      <BandsTable bands={data.bands} />
      <ForecastTable />
      <AlertsCard alerts={data.alerts} />
      <SummaryCard
        highlights={data.summary.highlights}
        recommendations={data.summary.recommendations}
      />
    </div>
  );
}
