"use client";

import { useEffect, useState } from "react";

export default function Watchlist({ items, onSelect, onRemove, onAlert }) {
  const [data, setData] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmSymbol, setConfirmSymbol] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stock data
  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!items || items.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        items.map(async (symbol) => {
          const res = await fetch(`/api/stock?symbol=${symbol}`);
          return await res.json();
        })
      );

      setData(results);
      setLoading(false);
    }

    load();
  }, [items]);

  // Format market cap
  function formatCap(num) {
    if (!num) return "-";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(1) + "T";
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    return num.toString();
  }

  return (
    <div className="space-y-2">

      {/* Confirm Remove Popup */}
      {confirmSymbol && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg space-y-4 w-80">
            <p className="text-lg font-semibold">
              Remove {confirmSymbol} from Watchlist?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmSymbol(null)}
                className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onRemove(confirmSymbol);
                  setConfirmSymbol(null);
                }}
                className="px-3 py-1 bg-red-500 rounded hover:bg-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Rows */}
      {loading ? (
        <div className="w-full py-10 flex justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching data…</span>
          </div>
        </div>
      ) : (
        data.map((s) => {
          const roundedChange = s.change?.toFixed(2);
          const roundedPercent = s.percentChange?.toFixed(2);

          const volumeSpike =
            s.avgVolume && s.volume
              ? (s.volume / s.avgVolume).toFixed(1) + "×"
              : "-";

          let rangePos = null;
          if (s.fiftyTwoWeekHigh && s.fiftyTwoWeekLow && s.price) {
            rangePos =
              ((s.price - s.fiftyTwoWeekLow) /
                (s.fiftyTwoWeekHigh - s.fiftyTwoWeekLow)) *
              100;
          }

          let dayPos = null;
          if (s.high && s.low && s.price) {
            dayPos = ((s.price - s.low) / (s.high - s.low)) * 100;
          }

          return (
            <div
              key={s.symbol}
              className="relative flex items-center bg-slate-800 p-3 rounded-lg hover:bg-slate-700"
            >
              {/* ICON */}
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                {s.logo ? (
                  <img
                    src={s.logo}
                    alt={s.symbol}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  s.symbol[0]
                )}
              </div>

              {/* SYMBOL */}
              <div
                className="font-semibold text-lg w-20 cursor-pointer"
                onClick={() => {
                  setMenuOpen(null);
                  onSelect(s.symbol);
                }}
              >
                {s.symbol}
              </div>

              {/* NAME */}
              <div
                className="flex-1 text-slate-400 truncate cursor-pointer"
                onClick={() => {
                  setMenuOpen(null);
                  onSelect(s.symbol);
                }}
              >
                {s.name}
              </div>

              {/* PRICE */}
              <div className="w-40 flex flex-col items-end text-right space-y-1 mr-10">
                <div className="font-semibold text-lg text-white">
                  ${s.price}
                </div>
              </div>

              {/* CHANGE */}
              <div className="w-32 text-sm text-white-400 space-y-1">
                <div>Change:</div>
                <div className={`text-sm ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {s.change >= 0 ? "▲ +" : "▼ -"}
                  {roundedChange} ({roundedPercent}%)
                </div>
              </div>

              {/* SECTOR */}
              <div className="w-32 flex flex-col items-center text-xs text-slate-400 space-y-1 mr-10">
                <div className="font-semibold text-slate-300">Sector</div>
                <div className="text-center w-full">
                  {s.sector || s.industry ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs">
                      {s.sector ? s.sector : s.industry}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-700 text-slate-500 text-xs">
                      —
                    </span>
                  )}
                </div>
              </div>

              {/* DAY RANGE */}
              <div className="w-32 flex flex-col items-center text-xs text-slate-400 space-y-1 mr-10">
                <div className="font-semibold text-slate-300">Day Range</div>
                <div className="w-full h-1 bg-slate-600 rounded relative overflow-hidden">
                  {dayPos !== null && (
                    <div
                      className="absolute top-0 h-1 bg-blue-400"
                      style={{ width: `${dayPos}%` }}
                    ></div>
                  )}
                </div>
                <div className="text-center w-full text-white">
                  {dayPos !== null ? dayPos.toFixed(0) + "%" : "-"}
                </div>
              </div>

              {/* 52W RANGE */}
              <div className="w-32 flex flex-col items-center text-xs text-slate-400 space-y-1 mr-10">
                <div className="font-semibold text-slate-300">52W Range</div>
                <div className="w-full h-1 bg-slate-600 rounded relative overflow-hidden">
                  {rangePos !== null && (
                    <div
                      className="absolute top-0 h-1 bg-green-400"
                      style={{ width: `${rangePos}%` }}
                    ></div>
                  )}
                </div>
                <div className="text-center w-full">
                  {rangePos !== null ? rangePos.toFixed(0) + "%" : "-"}
                </div>
              </div>

              {/* MARKET CAP */}
              <div className="w-32 text-sm text-white-400 space-y-1">
                <div>Market Cap:</div>
                <div>{formatCap(s.marketCap)}</div>
              </div>

              {/* VOLUME SPIKE */}
              <div className="w-32 text-sm text-white-400 space-y-1">
                <div>Volume Spike:</div>
                <div>{volumeSpike}</div>
              </div>

              {/* MENU BUTTON */}
              <button
                className="watchlist-button ml-4 text-xl px-2"
                onClick={() =>
                  setMenuOpen(menuOpen === s.symbol ? null : s.symbol)
                }
              >
                ⋮
              </button>

              {/* CONTEXT MENU */}
              {menuOpen === s.symbol && (
                <div className="watchlist-menu absolute right-2 top-full mt-2 bg-slate-700 p-2 rounded shadow-lg z-10">
                  <button
                    className="block w-full text-left px-3 py-1 hover:bg-slate-600"
                    onClick={() => {
                      setMenuOpen(null);
                      onSelect(s.symbol);
                    }}
                  >
                    View Details
                  </button>

                  <button
                    className="block w-full text-left px-3 py-1 hover:bg-slate-600"
                    onClick={() => {
                      setMenuOpen(null);
                      onAlert(s.symbol);
                    }}
                  >
                    Price Alerts
                  </button>

                  <button
                    className="block w-full text-left px-3 py-1 hover:bg-slate-600"
                    onClick={() => {
                      setMenuOpen(null);
                      setConfirmSymbol(s.symbol);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}