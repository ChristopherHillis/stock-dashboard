"use client";

import { useState } from "react";
import SearchBar from "@/components/Search";
import StockModal from "@/components/StockModal";
import Watchlist from "@/components/WatchList";
import Portfolio from "@/components/Portfolio"; // <-- NEW
import Gainers from "@/components/Gainers";
import Losers from "@/components/Losers";
import MarketOverview from "@/components/MarketOverview";
import Trending from "@/components/Trending";
import NewsFeed from "@/components/NewsFeed";
import RecentViewed from "@/components/RecentViewed";

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [openedFromWatchlist, setOpenedFromWatchlist] = useState(false);
  const [recent, setRecent] = useState([]);
  const [activeTab, setActiveTab] = useState("watchlist"); // "watchlist" | "portfolio"

  // Add to watchlist
  function handleAddToWatchlist(stock) {
    if (!watchlist.includes(stock.symbol)) {
      setWatchlist([...watchlist, stock.symbol]);
    }
    setSelectedSymbol(null);
  }

  // Remove from watchlist
  function handleRemove(symbol) {
    setWatchlist(watchlist.filter((s) => s !== symbol));
    setSelectedSymbol(null);
  }

  // Open modal + update recently viewed
  function openSymbol(symbol, fromWatchlist = false) {
    if (!symbol) return;

    setSelectedSymbol(symbol);
    setOpenedFromWatchlist(fromWatchlist);

    setRecent((prev) => {
      const updated = [symbol, ...prev.filter((s) => s !== symbol)];
      return updated.slice(0, 6);
    });
  }

  return (
    <div className="p-6 space-y-8 text-white">

      {/* Market Overview */}
      <MarketOverview />

      {/* Search + Recently Viewed */}
      <div className="space-y-2">
        <SearchBar onSelect={(symbol) => openSymbol(symbol, false)} />

        {recent.length > 0 && (
          <RecentViewed
            items={recent}
            onSelect={(symbol) => openSymbol(symbol, false)}
          />
        )}
      </div>

      {/* Stock Modal */}
      {selectedSymbol && (
        <StockModal
          symbol={selectedSymbol}
          fromWatchlist={openedFromWatchlist}
          onClose={() => setSelectedSymbol(null)}
          onAdd={handleAddToWatchlist}
          onRemove={handleRemove}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "watchlist" ? "bg-blue-600" : "bg-slate-700"
            }`}
          onClick={() => setActiveTab("watchlist")}
        >
          Watchlist
        </button>

        <button
          className={`px-4 py-2 rounded ${activeTab === "portfolio" ? "bg-blue-600" : "bg-slate-700"
            }`}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio
        </button>
      </div>

      {/* Watchlist or Portfolio */}
      {activeTab === "watchlist" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Your Watchlist</h2>
          <Watchlist
            items={watchlist}
            onSelect={(symbol) => openSymbol(symbol, true)}
          />
        </div>
      )}

      {activeTab === "portfolio" && (
        <div>
          <h2 className="text-xl font-bold mb-2">Your Portfolio</h2>
          <Portfolio
            items={portfolio}
            onSelect={(symbol) => openSymbol(symbol, false)}
            onUpdate={(newPortfolio) => setPortfolio(newPortfolio)}
          />
        </div>
      )}

      {/* Four‑section grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top Gainers */}
        <div>
          <h2 className="text-xl font-bold mb-2">Top Gainers</h2>
          <Gainers />
        </div>

        {/* Trending */}
        <div>
          <h2 className="text-xl font-bold mb-2">Trending</h2>
          <Trending onSelect={(symbol) => openSymbol(symbol, false)} />
        </div>

        {/* Top Losers */}
        <div>
          <h2 className="text-xl font-bold mb-2">Top Losers</h2>
          <Losers />
        </div>

        {/* Market News */}
        <div>
          <h2 className="text-xl font-bold mb-2">Market News</h2>
          <NewsFeed />
        </div>

      </div>
    </div>
  );
}