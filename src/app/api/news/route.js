import { NextResponse } from "next/server";

export async function GET() {
  const rssUrl = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US";

  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
  const json = await res.json();

  const articles = json.items.map((item) => ({
    title: item.title,
    url: item.link,
    source: "Yahoo Finance",
  }));

  return NextResponse.json({ articles });
}