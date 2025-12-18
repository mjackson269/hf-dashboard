export default function SolarCard({ solar }) {
  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
      <h2 className="text-xl font-bold mb-2">Solar Conditions</h2>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>SFI: {solar.sfi}</p>
        <p>Kp: {solar.kp}</p>
        <p>MUF: {solar.muf} MHz</p>
        <p>Sunspots: {solar.sunspots}</p>
        <p>X-ray: {solar.xray}</p>
        <p>Wind: {solar.solarWind.speed} km/s</p>
        <p>Density: {solar.solarWind.density} p/cm³</p>
      </div>
    </div>
  );
}