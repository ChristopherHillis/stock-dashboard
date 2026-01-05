"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function FullChart({ timestamps, closes }) {
  if (!timestamps?.length || !closes?.length) {
    return <div className="text-slate-500 text-sm">No chart data</div>;
  }

  const data = timestamps.map((t, i) => ({
    time: new Date(t * 1000).toISOString().split("T")[0], // FIXED
    value: closes[i]
  }));

  return (
    <div className="w-full h-40 bg-slate-900 rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis hide />
          <Tooltip />
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
  );
}