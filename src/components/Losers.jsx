"use client";

import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function Losers() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/movers");
      const json = await res.json();
      setData(json.losers);
    }
    load();
  }, []);

  if (!data) return <Loading />;

 return (
  <div className="space-y-2">
{data.slice(0, 5).map((s) => {
  const price = Number(s.price ?? 0);
  const prevClose = Number(s.prevClose ?? 0);
  const change = Number(s.change ?? 0);
  const changePercent = Number(s.changePercent ?? 0);

  const isUp = change > 0; // will usually be false here

  const priceText = price.toFixed(2);
  const prevCloseText = prevClose.toFixed(2);
  const changeText = change.toFixed(2);
  const percentText = changePercent.toFixed(2);

  return (
    <div
      key={s.symbol}
      className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 h-16"
    >
      <div>
        <p className="font-medium">{s.symbol}</p>

        <p
          className={`text-xs font-medium flex items-center gap-1 ${
            isUp ? "text-green-400" : "text-red-400"
          }`}
        >
          <span>{isUp ? "▲" : "▼"}</span>
          <span>
            {isUp ? "+" : ""}
            {changeText} ({percentText}%)
          </span>
        </p>

        <p className="text-[10px] text-slate-500">
          Prev: ${prevCloseText}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">${priceText}</p>
      </div>
    </div>
  );
})}
  </div>
);
}