import { NextResponse } from "next/server";

type GNewsArticle = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
};

export async function GET(request: Request) {
  const apiKey = process.env.GNEWS_API_KEY;
  const location = new URL(request.url).searchParams.get("location")?.trim() || "Pune Maharashtra";
  if (!apiKey) {
    return NextResponse.json({ articles: [], configured: false, location });
  }

  const query = encodeURIComponent(`(${location}) AND (flood OR flooding OR rainfall OR "heavy rain" OR landslide OR cyclone OR earthquake OR wildfire OR disaster)`);
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&country=in&max=10&sortby=publishedAt&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      return NextResponse.json({ error: "News provider request failed" }, { status: 502 });
    }

    const data = await response.json() as { articles?: GNewsArticle[] };
    const articles = (data.articles ?? []).map((article, index) => ({
      id: article.url || `${article.title || "news"}-${index}`,
      icon: "📰",
      type: "News",
      area: article.source?.name || "India",
      title: article.title || "Untitled news update",
      description: article.description || "",
      time: article.publishedAt || new Date().toISOString(),
      status: "Live",
      url: article.url || "",
      image: article.image || "",
    }));

    return NextResponse.json({ articles, configured: true, location, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Could not reach news provider" }, { status: 502 });
  }
}