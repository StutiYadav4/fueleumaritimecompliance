import { useEffect, useState } from "react";
import { fetchComparison } from "../hooks/useApi";
import { TARGET_INTENSITY } from "../../../shared/constant";


export default function CompareView() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchComparison().then((res) => setData(res));
  }, []);

  if (!data)
    return (
      <div className="text-center text-gray-500 p-4">
        Loading comparison data...
      </div>
    );

  return (
  <div className="space-y-4">


    {/* 📌 Target Box */}
    <div className="bg-blue-100 text-blue-900 px-4 py-3 rounded-lg shadow-sm border border-blue-200 text-center font-semibold">
      FuelEU Target Intensity:{" "}
      <span className="font-bold">{TARGET_INTENSITY} gCO₂e/MJ</span>
      <div className="text-sm font-normal text-blue-700 mt-1">
        (2% below reference value 91.16 gCO₂e/MJ)
      </div>
    </div>


    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 bg-white rounded-lg shadow-md">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            {[
              "Route ID",
              "Baseline Intensity",
              "Actual Intensity",
              "Difference in %",
              "Compliant or not"
            ].map((h) => (
              <th
                key={h}
                className="border px-4 py-3 text-center font-bold tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.comparisons.map((c: any, idx: number) => (
            <tr
              key={c.routeId}
              className={`border ${
                idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100"
              } hover:bg-blue-200 transition`}
            >
              <td className="border px-4 py-2 text-center font-medium">
                {c.routeId}
              </td>

              <td className="border px-4 py-2 text-center">
                {c.baseline.toFixed(2)}
              </td>

              <td className="border px-4 py-2 text-center">
                {c.comparison.toFixed(2)}
              </td>

              <td className="border px-4 py-2 text-center font-semibold">
                {c.percentDiff.toFixed(2)}%
              </td>

              <td className="border px-4 py-2 text-center">
                {c.compliant ? (
                  <span className="text-green-700 font-bold">YES</span>
                ) : (
                  <span className="text-red-600 font-bold">NO</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>   
  </div>     // closes main "space-y-4"
  );
}
