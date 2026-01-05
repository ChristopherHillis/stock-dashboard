import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count=10&scrIds=most_actives";

  const res = await fetch(url);
  const json = await res.json();

  const results = json.finance.result[0].quotes.map((q) => ({
    symbol: q.symbol,
    price: q.regularMarketPrice,
    change: q.regularMarketChange,
    percentChange: q.regularMarketChangePercent,
  }));

  return NextResponse.json(results);
}