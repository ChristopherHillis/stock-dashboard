export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return Response.json({ error: "Missing symbol" });
  }

  const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;

  try {
    // -----------------------------
    // 1. Fetch Yahoo chart data
    // -----------------------------
    const res = await fetch(chartUrl);
    const json = await res.json();

    const result = json.chart?.result?.[0];
    if (!result) {
      return Response.json({ error: "No chart data available" });
    }

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0] || {};
    const adj = result.indicators?.adjclose?.[0]?.adjclose || [];

    const last = quote.close?.length - 1;

    let closes = quote.close || [];

    // Fix flat close data
    const allSame = closes.length > 1 && closes.every(v => v === closes[0]);
    if (allSame && adj.length > 1) closes = adj;

    const stillFlat = closes.length > 1 && closes.every(v => v === closes[0]);
    if (stillFlat && quote.high?.length > 1) closes = quote.high;

    // Daily change
    const change = meta.regularMarketPrice - meta.chartPreviousClose;
    const percentChange = (change / meta.chartPreviousClose) * 100;

    // 50-day MA
    let fiftyDayMA = null;
    if (quote.close && quote.close.length > 0) {
      const sum = quote.close.reduce((a, b) => a + b, 0);
      fiftyDayMA = sum / quote.close.length;
    }

    // Trend
    let trend = null;
    if (closes.length > 1) {
      trend = closes[closes.length - 1] > closes[0] ? "up" : "down";
    }

    // Avg Volume
    let avgVolume = null;
    if (quote.volume && quote.volume.length > 0) {
      const valid = quote.volume.filter(v => typeof v === "number" && !isNaN(v));
      if (valid.length > 0) {
        avgVolume = valid.reduce((a, b) => a + b, 0) / valid.length;
      }
      if (!avgVolume && quote.volume?.[last]) {
        avgVolume = quote.volume[last];
      }
    }

    // Volatility (1M)
    let volatility = null;
    if (closes.length > 1) {
      const high = Math.max(...closes);
      const low = Math.min(...closes);
      volatility = (high - low) / low;
    }

    // -----------------------------
    // 2. Fetch longName (Yahoo quoteType)
    // -----------------------------
    const quoteTypeUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=quoteType`;
    const quoteTypeRes = await fetch(quoteTypeUrl);
    const quoteTypeJson = await quoteTypeRes.json();

    const longName =
      quoteTypeJson?.quoteSummary?.result?.[0]?.quoteType?.longName ||
      meta.longName ||
      symbol;

    // Domain guesser
    function guessDomainFromName(name) {
      if (!name) return null;

      const cleaned = name
        .replace(/,? Inc\.?/i, "")
        .replace(/,? Corporation/i, "")
        .replace(/,? Corp\.?/i, "")
        .replace(/,? Ltd\.?/i, "")
        .replace(/,? PLC/i, "")
        .replace(/ Holdings/i, "")
        .replace(/ Group/i, "")
        .trim()
        .replace(/\s+/g, "");

      return cleaned ? `${cleaned.toLowerCase()}.com` : null;
    }

    const domain = guessDomainFromName(longName);

    // -----------------------------
    // 3. Fetch Finnhub fundamentals
    // -----------------------------
    const finnhubUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
    const finnhubRes = await fetch(finnhubUrl);
    const finnhubJson = await finnhubRes.json();

    const sector = finnhubJson?.sector || null;
    const industry = finnhubJson?.finnhubIndustry || null;
    const marketCap = finnhubJson?.marketCapitalization || null;
    const beta = finnhubJson?.beta || null;
    const logo = finnhubJson?.logo || null;

    // -----------------------------
    // 4. Return merged JSON
    // -----------------------------
    return Response.json({
      symbol: meta.symbol,
      name: longName,

      // Yahoo price data
      price: meta.regularMarketPrice ?? null,
      prevClose: meta.chartPreviousClose ?? null,
      open: quote.open?.[last] ?? null,
      high: quote.high?.[last] ?? null,
      low: quote.low?.[last] ?? null,
      volume: quote.volume?.[last] ?? null,

      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,

      currency: meta.currency,
      exchange: meta.exchangeName,

      timestamp: result.timestamp || [],
      closes,
      change,
      percentChange,
      fiftyDayMA,
      trend,
      avgVolume,
      volatility,

      // Domain + logo
      domain,
      logo,

      // Finnhub fundamentals
      sector,
      industry,
      marketCap,
      beta
    });

  } catch (err) {
    console.error("Yahoo error:", err);
    return Response.json({ error: "Failed to fetch stock data" });
  }
}