export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ results: [] });
  }

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${query}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    const results = json.quotes
      .filter(q => q.quoteType === "EQUITY")
      .slice(0, 10)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname,
        exchange: q.exchange,
      }));

    return Response.json({ results });
  } catch (err) {
    console.error("Search error:", err);
    return Response.json({ results: [] });
  }
}