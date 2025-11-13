import { useState } from "react";
import { fetchCB, bankSurplus, applyBankSurplus } from "../hooks/useApi";

/**
 * BankingView (defensive, crash-proof)
 * - Uses safe parsing to avoid toFixed() crashes
 * - Sends amountT to /banking/bank when banking
 * - Converts backend response fields to Numbers
 */

export default function BankingView() {
  const [shipId, setShipId] = useState("");
  const [year, setYear] = useState("2025");
  const [cbData, setCbData] = useState<{ cb_before?: number; cb_after?: number; applied?: number } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Utility - safely format numbers
  const safeFixed = (v: any, digits = 2) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "--";
    return n.toFixed(digits);
  };

  // Load compliance balance from backend
  async function loadCB() {
    setError("");
    setMessage("");
    setCbData(null);

    if (!shipId.trim()) {
      setError("Enter a valid Ship ID.");
      return;
    }

    if (!year || Number.isNaN(Number(year))) {
      setError("Enter a valid year.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetchCB(Number(year), shipId.trim());

      // backend might return error field
      if (!res || (res.error && res.error.length)) {
        setError("Backend returned an error while loading CB.");
        return;
      }

      // convert returned values to numbers defensively
      const before = Number(res.cb_before ?? res.cb_t ?? res.cb ?? NaN);
      const after = Number(res.cb_after ?? before);

      setCbData({
        cb_before: Number.isFinite(before) ? before : undefined,
        cb_after: Number.isFinite(after) ? after : undefined,
        applied: Number.isFinite(res.applied) ? Number(res.applied) : undefined,
      });
    } catch (err) {
      console.error("loadCB error:", err);
      setError("Could not load CB. Check backend or network.");
    } finally {
      setLoading(false);
    }
  }

  // Bank surplus: bank the full available surplus by default
  async function handleBank() {
    setError("");
    setMessage("");

    if (!cbData || !Number.isFinite(cbData.cb_before)) {
      setError("Load CB first.");
      return;
    }

    const available = Number(cbData.cb_before);
    if (available <= 0) {
      setError("No positive CB (surplus) available to bank.");
      return;
    }

    // amountToBank = whole available surplus unless you want partial amounts UI
    const amountToBank = available;

    try {
      setLoading(true);
      // bankSurplus(shipId, year, amountT) — ensure your useApi matches this
      const res = await bankSurplus(shipId.trim(), Number(year), amountToBank);

      // Validate backend response shape and convert to numbers
      const before = Number(res.cb_before ?? res.cb_t ?? cbData.cb_before);
      const after = Number(res.cb_after ?? (before - (res.banked ?? amountToBank)));

      // show message and update cbData safely
      setCbData({
        cb_before: Number.isFinite(before) ? before : undefined,
        cb_after: Number.isFinite(after) ? after : undefined,
        applied: Number.isFinite(res.applied) ? Number(res.applied) : undefined,
      });

      setMessage(`Banked ${res.banked ?? amountToBank} (tonnes).`);
    } catch (err: any) {
      console.error("handleBank error:", err);
      // if backend returns an error body, try to show it:
      const msg = err?.response?.data?.error || err?.message || "Banking failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  // Apply banked surplus to deficit
  async function handleApply() {
    setError("");
    setMessage("");

    if (!shipId.trim()) {
      setError("Enter a valid Ship ID.");
      return;
    }

    try {
      setLoading(true);
      const res = await applyBankSurplus(shipId.trim(), Number(year));

      if (res?.error) {
        setError(String(res.error));
        return;
      }

      const before = Number(res.cb_before ?? cbData?.cb_before);
      const after = Number(res.cb_after ?? (before + (res.applied ?? 0)));

      setCbData({
        cb_before: Number.isFinite(before) ? before : undefined,
        cb_after: Number.isFinite(after) ? after : undefined,
        applied: Number.isFinite(res.applied) ? Number(res.applied) : undefined,
      });

      setMessage(res.applied > 0 ? `Applied ${res.applied} tonnes.` : "Nothing applied.");
    } catch (err: any) {
      console.error("handleApply error:", err);
      const msg = err?.response?.data?.error || err?.message || "Apply failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-100 border border-blue-300 text-blue-900 px-4 py-3 rounded-lg shadow font-semibold text-center">
        FuelEU Article 20 – Banking
        <div className="text-sm text-blue-700 font-normal">
          Store surplus CB and use it later to cover deficits.
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 border border-gray-200">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Ship ID"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            className="border p-2 rounded w-40"
          />

          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 rounded w-32"
          />

          <button
            onClick={loadCB}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load CB"}
          </button>
        </div>

        {/* Error & Message */}
        {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
        {message && <div className="text-green-700 font-semibold mt-2">{message}</div>}

        {/* Display CB safely */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm mt-2">
          <div className="font-semibold text-blue-900 text-lg">Compliance Balance (CB)</div>

          <div className="mt-2 text-blue-800">
            <strong>Before:</strong> {cbData ? safeFixed(cbData.cb_before) : "--"}
          </div>

          <div className="text-blue-800">
            <strong>After:</strong> {cbData ? safeFixed(cbData.cb_after) : "--"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={handleBank}
            disabled={!cbData || Number(cbData.cb_before) <= 0 || loading}
            className={`px-4 py-2 rounded font-bold text-white shadow ${
              !cbData || Number(cbData.cb_before) <= 0
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Bank Surplus
          </button>

          <button
            onClick={handleApply}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow font-bold"
          >
            Apply Surplus
          </button>
        </div>
      </div>
    </div>
  );
}
