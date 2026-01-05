"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function FullChart({ timestamps, closes, symbol = "", currency = "USD" }) {
    if (!timestamps?.length || !closes?.length) {
        return <div className="text-slate-500 text-sm">No chart data</div>;
    }

    const data = timestamps
        .map((t, i) => {
            const close = closes[i];
            if (typeof close !== "number") return null;

            return {
                time: new Date(t * 1000).toISOString().split("T")[0],
                value: Number(close.toFixed(2))
            };
        })
        .filter(Boolean);

    if (!data.length) {
        return <div className="text-slate-500 text-sm">No chart data</div>;
    }

    return (
        <div className="w-full bg-slate-900 rounded-lg p-4 relative">
            <p className="text-xs uppercase text-slate-400 text-center mb-1">
                {symbol} — 1‑Month Price
            </p>

            <div className="relative h-40">
                <p className="text-xs text-slate-500 absolute left-0 top-1/2 -translate-y-1/2 -rotate-90">
                    Price ({currency})
                </p>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ left: 40, right: 10, top: 10, bottom: 10 }}>
                        <XAxis
                            dataKey="time"
                            tickFormatter={(date) => date.slice(5)}
                            tick={{ fontSize: 10 }}
                        />
                        <YAxis
                            width={40}
                            tickFormatter={(value) => `$${Math.round(value)}`}
                            tick={{ fontSize: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                color: "white",
                                fontSize: "12px",
                                padding: "6px 10px"
                            }}
                            labelStyle={{
                                color: "#94a3b8",
                                marginBottom: "4px"
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
                        />

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-500 text-center">Date</p>
        </div>
    );
}