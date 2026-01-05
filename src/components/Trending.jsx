"use client";

import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function Trending({ onSelect }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trending");
      const json = await res.json();

      // Normalize and sanitize data
      const normalized = json.slice(0, 5).map((s) => {
        const price = Number(s.price ?? 0);
        const change = Number(s.change ?? 0);

        // Try both possible percent field names
        const rawPercent =
          s.percentChange !== undefined
            ? s.percentChange
            : s.changePercent !== undefined
            ? s.changePercent
            : 0;

        const changePercent = Number(rawPercent ?? 0);

        // Try different possible prevClose fields, or derive it
        const prevCloseRaw =
          s.prevClose ??
          s.previousClose ??
          (price && change ? price - change : null);

        const prevClose = prevCloseRaw !== null ? Number(prevCloseRaw) : null;

        return {
          symbol: s.symbol,
          price,
          change,
          changePercent,
          prevClose,
        };
      });

      setData(normalized);
    }
    load();
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="space-y-2">
      {data.map((s) => {
        const isUp = s.change > 0;

        // Format numbers safely
        const priceText =
          s.price || s.price === 0 ? s.price.toFixed(2) : "-";

        const changeText =
          s.change || s.change === 0 ? s.change.toFixed(2) : "-";

        const percentText =
          s.changePercent || s.changePercent === 0
            ? s.changePercent.toFixed(2)
            : null;

        const prevCloseText =
          s.prevClose || s.prevClose === 0 ? s.prevClose.toFixed(2) : "-";

        return (
          <button
            key={s.symbol}
            onClick={() => onSelect(s.symbol)}
            className="w-full flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 h-16 hover:bg-slate-700 text-left"
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
                  {s.change > 0 && "+"}
                  {changeText}
                  {percentText !== null && ` (${percentText}%)`}
                </span>
              </p>

              <p className="text-[10px] text-slate-500">
                Prev: ${prevCloseText}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">${priceText}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}