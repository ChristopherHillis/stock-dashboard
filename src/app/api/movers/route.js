export async function GET() {
  const gainersUrl =
    "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count=25&scrIds=day_gainers";

  const losersUrl =
    "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count=25&scrIds=day_losers";

  try {
    const [gainersRes, losersRes] = await Promise.all([
      fetch(gainersUrl),
      fetch(losersUrl)
    ]);

    const gainersJson = await gainersRes.json();
    const losersJson = await losersRes.json();

    const gainers = gainersJson.finance.result[0].quotes.slice(0, 5).map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      prevClose: q.regularMarketPreviousClose,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent
    }));

    const losers = losersJson.finance.result[0].quotes.slice(0, 5).map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      prevClose: q.regularMarketPreviousClose,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent
    }));

    return Response.json({ gainers, losers });
  } catch (err) {
    console.error("Yahoo Finance error:", err);
    return Response.json({ error: "Failed to fetch movers" });
  }
}