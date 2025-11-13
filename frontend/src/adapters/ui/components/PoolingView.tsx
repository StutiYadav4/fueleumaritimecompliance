import { useState } from "react";
import { createPool, fetchCB } from "../hooks/useApi";

export default function PoolingView() {
  const [year, setYear] = useState("2025");
  const [members, setMembers] = useState<{ shipId: string; cbBefore: number }[]>([]);
  const [newShipId, setNewShipId] = useState("");
  const [newCb, setNewCb] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* ----------------------------------------
     ADD MEMBER (with VALID SHIP ID check)
  -----------------------------------------*/
  async function addMember() {
    setError("");
    setMessage("");

    if (!newShipId.trim()) {
      setError("Enter a valid Ship ID.");
      return;
    }

    if (members.some((m) => m.shipId === newShipId.trim())) {
      setError("Ship already added to pool.");
      return;
    }

    if (newCb === "") {
      setError("Enter value of CB Before.");
      return;
    }

    const cb = Number(newCb);
    if (isNaN(cb)) {
      setError("CB must be a number.");
      return;
    }

    // Validate Ship Exists using CB API
    try {
      const validate = await fetchCB(Number(year), newShipId.trim());
      if (!validate || validate.error) {
        setError("Ship ID does not exist in system.");
        return;
      }
    } catch (err) {
      setError("Ship ID does not exist in system.");
      return;
    }

    // Add Member
    setMembers([...members, { shipId: newShipId.trim(), cbBefore: cb }]);
    setNewShipId("");
    setNewCb("");
  }

  /* ----------------------------------------
     CLEAR POOL MEMBERS
  -----------------------------------------*/
  function clearMembers() {
    setMembers([]);
    setResult(null);
    setMessage("");
    setError("");
  }

  /* ----------------------------------------
     COMPUTE SUM
  -----------------------------------------*/
  const poolSum = members.reduce((a, m) => a + Number(m.cbBefore), 0);
  const isValid = poolSum >= 0;

  /* ----------------------------------------
     CREATE POOL
  -----------------------------------------*/
  async function handleCreatePool() {
    setError("");
    setMessage("");

    try {
      const res = await createPool(Number(year), members);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError("Pool creation failed.");
    }
  }

  return (
    <div className="space-y-6 p-4">

      {/* Header */}
      <div className="bg-purple-100 border border-purple-300 text-purple-900 px-4 py-3 rounded-lg shadow font-semibold text-center">
        FuelEU Article 21 – Pooling
        <div className="text-sm text-purple-700 font-normal">
          Combine ship CBs so surplus ships help ships with deficit.
        </div>
      </div>

      {/* Add Member Section */}
      <div className="bg-white p-4 rounded-lg border shadow space-y-4">
        <div className="flex gap-4 items-center">
          
          {/* Ship ID */}
          <input
            value={newShipId}
            onChange={(e) => setNewShipId(e.target.value)}
            placeholder="Ship ID"
            className="border p-2 rounded w-40"
          />

          {/* CB Before */}
          <input
            value={newCb}
            onChange={(e) => setNewCb(e.target.value)}
            placeholder="CB Before"
            className="border p-2 rounded w-32"
          />

          {/* Add Button */}
          <button
            onClick={addMember}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Add
          </button>

          {/* Clear Button */}
          <button
            onClick={clearMembers}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Clear
          </button>

        </div>

        {/* Error Message */}
        {error && <div className="text-red-600 font-semibold">{error}</div>}

        {/* Members Table */}
        {members.length > 0 && (
          <table className="min-w-full border bg-white rounded shadow">
            <thead className="bg-purple-100 text-purple-900">
              <tr>
                <th className="border px-4 py-2">Ship ID</th>
                <th className="border px-4 py-2">CB Before</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2 text-center">{m.shipId}</td>
                  <td className="border px-4 py-2 text-center">{m.cbBefore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pool Sum */}
        <div className={`text-lg font-bold ${
            isValid ? "text-green-600" : "text-red-600"
          }`}>
          Pool Sum: {poolSum}
        </div>

        {/* Create Pool Button */}
        <button
          disabled={!isValid || members.length === 0}
          onClick={handleCreatePool}
          className={`px-4 py-2 rounded font-bold text-white shadow 
            ${
              isValid && members.length > 0
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400"
            }`}
        >
          Create Pool
        </button>

      </div>

      {/* Result Table */}
      {result && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded shadow mt-4">
          <div className="font-semibold text-purple-900 text-lg">Pool Result</div>

          <table className="min-w-full border mt-2 bg-white">
            <thead className="bg-purple-100">
              <tr>
                <th className="border px-4 py-2">Ship</th>
                <th className="border px-4 py-2">CB Before</th>
                <th className="border px-4 py-2">CB After</th>
              </tr>
            </thead>

            <tbody>
              {result.members.map((m: any, i: number) => (
                <tr key={i}>
                  <td className="border px-4 py-2 text-center">{m.shipId}</td>
                  <td className="border px-4 py-2 text-center">{m.cbBefore}</td>
                  <td className="border px-4 py-2 text-center font-bold">{m.cbAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
