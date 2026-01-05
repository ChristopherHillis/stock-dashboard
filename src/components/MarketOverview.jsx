"use client";

import { useEffect, useState } from "react";

export default function MarketOverview() {
  const [data, setData] = useState([]);

  const indices = ["^GSPC", "^IXIC", "^DJI", "^GSPTSE"]; // S&P, NASDAQ, Dow, TSX

  useEffect(() => {
    async function load() {
      const results = [];
      for (const symbol of indices) {
        const res = await fetch(`/api/stock?symbol=${symbol}`);
        const json = await res.json();
        results.push(json);
      }
      setData(results);
    }
    load();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {data.map((i) => (
        <div
          key={i.symbol}
          className="bg-slate-800 p-3 rounded-lg text-center"
        >
          <p className="text-xs text-slate-400">{i.symbol}</p>
          <p className="text-lg font-semibold">{i.price}</p>
          <p className={i.change >= 0 ? "text-green-400" : "text-red-400"}>
            {i.change >= 0 ? "+" : ""}
            {i.percentChange.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}