import { useEffect, useState } from "react";
import { fetchRoutes, setBaseline } from "../hooks/useApi";

export default function RoutesTable() {
  const [routes, setRoutes] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Filters
  const [vesselType, setVesselType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetchRoutes();
    setRoutes(res);
    setFiltered(res);
  }

  // Filtering logic
  useEffect(() => {
    let data = [...routes];

    if (vesselType) data = data.filter((r: any) => r.vesselType === vesselType);
    if (fuelType) data = data.filter((r: any) => r.fuelType === fuelType);
    if (year) data = data.filter((r: any) => r.year.toString() === year);

    setFiltered(data);
  }, [vesselType, fuelType, year, routes]);

  const vesselTypes = [...new Set(routes.map((r: any) => r.vesselType))];
  const fuelTypes = [...new Set(routes.map((r: any) => r.fuelType))];
  const years = [...new Set(routes.map((r: any) => r.year))];

  async function makeBaseline(id: number) {
    await setBaseline(id);
    await load();
  }

  return (
    <div className="space-y-4">

      {/* FILTERS */}
      <div className="flex gap-4 flex-wrap bg-orange-100/60 p-4 rounded-lg shadow-sm">
        <select
          className="p-2 rounded border bg-white"
          value={vesselType}
          onChange={(e) => setVesselType(e.target.value)}
        >
          <option value="">All Vessel Types</option>
          {vesselTypes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded border bg-white"
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
        >
          <option value="">All Fuel Types</option>
          {fuelTypes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded border bg-white"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-orange-200 bg-white rounded-lg shadow-md">
          <thead className="bg-orange-200/60 text-orange-900">
            <tr>
              {[
                "Route ID",
                "Vessel Type",
                "Fuel Type",
                "Year",
                "Intensity (g/MJ)",
                "Fuel (t)",
                "Distance (km)",
                "Emissions (t)",
                "Baseline",
                "Action"
              ].map((head) => (
                <th
                  key={head}
                  className="border px-4 py-3 text-center font-bold tracking-wide"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((r: any, idx: number) => (
              <tr
                key={r.id}
                className={`border ${
                  idx % 2 === 0 ? "bg-orange-50/50" : "bg-orange-100/50"
                } hover:bg-orange-200/40 transition`}
              >
                <td className="border px-4 py-2 text-center">{r.routeId}</td>
                <td className="border px-4 py-2 text-center">{r.vesselType}</td>
                <td className="border px-4 py-2 text-center">{r.fuelType}</td>
                <td className="border px-4 py-2 text-center">{r.year}</td>
                <td className="border px-4 py-2 text-center">{r.ghgIntensity}</td>
                <td className="border px-4 py-2 text-center">{r.fuelConsumptionT}</td>
                <td className="border px-4 py-2 text-center">{r.distanceKm}</td>
                <td className="border px-4 py-2 text-center">{r.totalEmissionsT}</td>

                {/* Baseline Column – Bold */}
                <td className="border px-4 py-2 text-center font-bold text-orange-700">
                  {r.isBaseline ? "Baseline" : "—"}
                </td>

                {/* Button */}
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => makeBaseline(r.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded shadow font-semibold"
                  >
                    Set Baseline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
