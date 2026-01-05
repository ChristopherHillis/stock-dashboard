"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

export default function Portfolio({ items, onSelect, onUpdate }) {
    const [stocks, setStocks] = useState([]);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadText, setUploadText] = useState("");
    const [loading, setLoading] = useState(true);

    // Load stock data
    useEffect(() => {
        async function load() {
            setLoading(true);

            if (!items || items.length === 0) {
                setStocks([]);
                setLoading(false);
                return;
            }

            const results = await Promise.all(
                items
                    .filter(Boolean) // remove null/undefined
                    .map(async (entry) => {
                        // Normalize entry
                        const symbol =
                            typeof entry === "string"
                                ? entry.toUpperCase()
                                : entry.symbol?.toUpperCase();

                        const quantity =
                            typeof entry === "string"
                                ? 0
                                : Number(entry.quantity) || 0;

                        if (!symbol) {
                            return null; // skip invalid entries
                        }

                        const res = await fetch(`/api/stock?symbol=${symbol}`);
                        const json = await res.json();

                        return { ...json, symbol, quantity };
                    })
            );

            setStocks(results.filter(Boolean)); // remove nulls

            setStocks(results);
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

    // Parse upload text
    function handleUpload() {
        const lines = uploadText.split("\n");

        const parsed = lines
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => {
                const parts = line.split(/\s+/);
                const quantity = Number(parts.pop());
                const symbol = parts.join(" ").toUpperCase();
                return { symbol, quantity };
            });

        onUpdate(parsed);
        setUploadOpen(false);
        setUploadText("");
    }

    return (
        <div className="space-y-2">

            {/* Upload Modal */}
            {uploadOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-6 rounded-lg w-[600px] space-y-4 border border-slate-700">
                        <h2 className="text-xl font-bold">Upload Portfolio</h2>

                        <textarea
                            className="w-full h-64 p-3 bg-slate-800 border border-slate-700 rounded text-white"
                            placeholder={`AAPL 10\nMSFT 5\nNVDA 2`}
                            value={uploadText}
                            onChange={(e) => setUploadText(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setUploadOpen(false)}
                                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                            >
                                Save Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio Rows */}
            {loading ? (
                <div className="w-full py-10 flex justify-center">
                    <Loading />
                </div>
            ) : (
                stocks.map((s) => {
                    if (!s || !s.symbol) return null;
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
                                    <img src={s.logo} alt={s.symbol} className="w-full h-full object-cover" />
                                ) : (
                                    s.symbol[0]
                                )}
                            </div>

                            {/* SYMBOL */}
                            <div
                                className="font-semibold text-lg w-20 cursor-pointer"
                                onClick={() => onSelect(s.symbol)}
                            >
                                {s.symbol}
                            </div>

                            {/* NAME */}
                            <div
                                className="flex-1 text-slate-400 truncate cursor-pointer"
                                onClick={() => onSelect(s.symbol)}
                            >
                                {s.name}
                            </div>

                            {/* QUANTITY */}
                            <div className="w-20 text-center text-white font-semibold">
                                Qty: {s.quantity}
                            </div>

                            {/* PRICE */}
                            <div className="w-40 flex flex-col items-end text-right space-y-1 mr-10">
                                <div className="font-semibold text-lg text-white">
                                    ${(s.price * s.quantity).toFixed(2)}
                                </div>

                                <div className="text-slate-400 text-sm">
                                    (${s.price.toFixed(2)} each)
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
                                        <div className="absolute top-0 h-1 bg-blue-400" style={{ width: `${dayPos}%` }}></div>
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
                                        <div className="absolute top-0 h-1 bg-green-400" style={{ width: `${rangePos}%` }}></div>
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
                        </div>
                    );
                })
            )}

            {/* Upload Button */}
            <button
                onClick={() => setUploadOpen(true)}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
            >
                Upload Portfolio
            </button>
        </div>
    );
}