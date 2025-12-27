export default function AlertsCard({ alerts }) {
  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
      <h2 className="text-xl font-bold mb-2">Alerts</h2>

      {alerts.map((alert, i) => (
        <div
          key={i}
          className="border-l-4 border-blue-500 dark:border-blue-400 pl-3 mb-3"
        >
          <p className="font-semibold">{alert.type}</p>
          <p className="text-sm">{alert.message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {alert.impact}
          </p>
        </div>
      ))}
    </div>
  );
}