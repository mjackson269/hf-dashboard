"use client";

import { useSolarData } from "./hooks/useSolarData";
import SolarCard from "./components/SolarCard";
import BandsTable from "./components/BandsTable";
import ForecastTable from "./components/ForecastTable";
import AlertsCard from "./components/AlertsCard";
import SummaryCard from "./components/SummaryCard";

export default function Page() {
  const { data, loading, error } = useSolarData();

  // ✅ Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        {/* Card skeleton */}
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-32" />

        {/* Table skeleton */}
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-48" />

        {/* Forecast skeleton */}
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-24" />

        {/* Alerts skeleton */}
        <div className="p-4 rounded-lg shadow bg-slate-200 dark:bg-slate-700 animate-pulse h-32" />
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading data: {error}
      </div>
    );
  }

  // ✅ Main dashboard
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