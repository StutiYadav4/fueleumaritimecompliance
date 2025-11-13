import { useState } from "react";
import RoutesTable from "./adapters/ui/components/RoutesTable";
import CompareView from "./adapters/ui/components/CompareView";
import BankingView from "./adapters/ui/components/BankingView";
import PoolingView from "./adapters/ui/components/PoolingView";

export default function App() {
  const [tab, setTab] = useState("routes");

  const tabs = [
    { id: "routes", label: "Routes" },
    { id: "compare", label: "Compare" },
    { id: "banking", label: "Banking" },
    { id: "pooling", label: "Pooling" },
  ];

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="bg-white shadow-md py-4 px-6 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900">
          FuelEU Maritime Compliance Dashboard
        </h1>

        {/* TABS */}
        <nav className="flex gap-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  tab === t.id
                    ? "bg-orange-500 text-white shadow-md scale-105"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {tab === "routes" && <RoutesTable />}
          {tab === "compare" && <CompareView />}
          {tab === "banking" && <BankingView />}
          {tab === "pooling" && <PoolingView />}
        </div>
      </main>
    </div>
  );
}

