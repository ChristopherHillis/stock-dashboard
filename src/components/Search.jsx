"use client";

import { useState } from "react";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(value) {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/search?q=${value}`);
    const json = await res.json();
    setResults(json.results);
  }

  return (
    <div className="relative">
      <input
        className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg"
        placeholder="Search stocks..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {results.length > 0 && (
        <div className="absolute left-0 right-0 bg-slate-900 rounded-lg mt-1 shadow-lg z-20">
          {results.map((r) => (
            <div
              key={r.symbol}
              className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
              onClick={() => {
                onSelect(r.symbol);
                setResults([]);
                setQuery("");
              }}
            >
              <p className="font-medium">{r.symbol}</p>
              <p className="text-xs text-slate-400">{r.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}