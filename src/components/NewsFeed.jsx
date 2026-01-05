"use client";

import { useEffect, useState } from "react";

export default function NewsFeed() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/news");
      const json = await res.json();
      setNews(json.articles || []);
    }
    load();
  }, []);

  return (
    <div className="space-y-2">
      {news.slice(0, 5).map((n, i) => (
        <a
          key={i}
          href={n.url}
          target="_blank"
          className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 h-16 hover:bg-slate-700"
        >
          <div className="flex-1">
            <p className="font-medium truncate">{n.title}</p>
            <p className="text-[10px] text-slate-400 mt-1">{n.source}</p>
          </div>

          {/* Optional: small arrow icon to match the vibe */}
          <div className="text-slate-500 text-xs ml-3">↗</div>
        </a>
      ))}
    </div>
  );
}