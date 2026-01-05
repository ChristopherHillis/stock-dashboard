"use client";

import { useEffect, useState } from "react";
import FullChart from "@/components/FullChart";


function formatPrice(value, currency = "USD") {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency
    }).format(value);
}

function formatBigNumber(value) {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-US").format(value);
}

export default function StockModal({
    symbol,
    onClose,
    onAdd,
    onRemove,
    fromWatchlist = false
}) {
    const [data, setData] = useState(null);

    useEffect(() => {
        async function load() {
            const res = await fetch(`/api/stock?symbol=${symbol}`);
            const json = await res.json();
            setData(json);
        }
        load();
    }, [symbol]);

    if (!data || data.error) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-slate-800 p-6 rounded-lg text-white">
                    {data?.error || "Loading…"}
                </div>
            </div>
        );
    }

    const {
        name,
        price,
        prevClose,
        open,
        high,
        low,
        volume,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        currency,
        exchange,
        timestamp,
        closes,
        change,
        percentChange,
        fiftyDayMA,
        avgVolume,
        trend,
        domain,
        sector,
        industry
    } = data;

    const clearbit = domain ? `https://logo.clearbit.com/${domain}` : null;
    const fallback = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto text-white space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    {clearbit && (
                        <img
                            src={clearbit}
                            onError={(e) => (e.target.src = fallback)}
                            alt={`${symbol} logo`}
                            className="w-10 h-10 rounded bg-white/10 p-1"
                        />
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">{symbol}</h2>
                        <p className="text-slate-400 text-sm">{name}</p>
                    </div>
                </div>

                {/* TODAY (full width) */}
                <div>
                    <p className="text-xs uppercase text-slate-400 mb-1">Today</p>

                    <div className="flex gap-6">
                        {/* Left: Base Price (aligned with left column) */}
                        <div className="flex-1">
                            <p className="text-3xl font-semibold">
                                {formatPrice(price, currency)}{" "}
                                <span className="text-base text-slate-400">{currency}</span>
                            </p>
                        </div>

                        {/* Right: Change + Prev Close (aligned above Trend & MA) */}
                        <div className="flex-1">
                            <p className={`text-sm ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(2)} ({percentChange.toFixed(2)}%)
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Prev Close: {formatPrice(prevClose, currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TWO COLUMN DASHBOARD */}
                <div className="flex gap-6 items-start">

                    {/* LEFT COLUMN */}
                    <div className="flex-1">

                        {/* Intraday */}
                        <div className="mb-6">
                            <p className="text-xs uppercase text-slate-400 mb-2">Intraday</p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-400">Open:</span>{" "}
                                    {formatPrice(open, currency)}
                                </p>
                                <p>
                                    <span className="text-slate-400">Day Range:</span>{" "}
                                    {formatPrice(low, currency)} – {formatPrice(high, currency)}
                                </p>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="mb-6">
                            <p className="text-xs uppercase text-slate-400 mb-2">Volume</p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-400">Volume:</span>{" "}
                                    {formatBigNumber(volume)}
                                </p>
                                <p>
                                    <span className="text-slate-400">Avg Volume (30D):</span>{" "}
                                    {formatBigNumber(avgVolume)}
                                </p>
                            </div>
                        </div>

                        {/* Sector & Industry (fundamentals) */}
                        <div className="mb-6">
                            {sector ? (
                                <>
                                    <p className="text-xs uppercase text-slate-400 mb-1">Sector</p>
                                    <p className="text-sm text-slate-300">{sector}</p>

                                    <p className="text-xs uppercase text-slate-400 mt-3 mb-1">Industry</p>
                                    <p className="text-sm text-slate-300">{industry || "—"}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs uppercase text-slate-400 mb-1">Industry</p>
                                    <p className="text-sm text-slate-300">{industry || "—"}</p>
                                </>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex-1">

                        {/* Trend & MA */}
                        <div className="mb-6">
                            <p className="text-xs uppercase text-slate-400 mb-2">Trend & Moving Average</p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-400">Trend:</span>{" "}
                                    <span className={trend === "up" ? "text-green-400" : "text-red-400"}>
                                        {trend === "up" ? "↑ Uptrend" : "↓ Downtrend"}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-slate-400">50-Day MA:</span>{" "}
                                    {formatPrice(fiftyDayMA, currency)}
                                </p>
                            </div>
                        </div>

                        {/* 52 Week */}
                        <div className="mb-6">
                            <p className="text-xs uppercase text-slate-400 mb-2">52-Week Range</p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-slate-400">52W High:</span>{" "}
                                    {formatPrice(fiftyTwoWeekHigh, currency)}
                                </p>
                                <p>
                                    <span className="text-slate-400">52W Low:</span>{" "}
                                    {formatPrice(fiftyTwoWeekLow, currency)}
                                </p>
                            </div>
                        </div>

                        {/* Exchange */}
                        <div className="mb-6">
                            <p className="text-xs uppercase text-slate-400 mb-1">Exchange</p>
                            <p className="text-sm text-slate-300">{exchange}</p>
                        </div>

                    </div>
                </div>

                {/* Chart */}
                <FullChart
                    timestamps={timestamp}
                    closes={closes}
                    symbol={symbol}
                    currency={currency}
                />

                {/* Buttons */}
                {/* Buttons */}
                <div className="pt-2 flex gap-2">
                    {fromWatchlist ? (
                        <button
                            className="flex-1 bg-red-600 py-2 rounded-lg text-sm font-medium"
                            onClick={() => onRemove(symbol)}
                        >
                            Remove From Watchlist
                        </button>
                    ) : (
                        <button
                            className="flex-1 bg-blue-600 py-2 rounded-lg text-sm font-medium"
                            onClick={() => onAdd(data)}
                        >
                            Add To WatchList
                        </button>
                    )}

                    <button
                        className="flex-1 bg-slate-700 py-2 rounded-lg text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}