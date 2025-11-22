// app/api/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  if (!q) return NextResponse.json({ error: "missing q" }, { status: 400 });

  const API_KEY = process.env.GOOGLE_CSE_API_KEY;
  const CX = process.env.GOOGLE_CSE_CX;

  if (!API_KEY || !CX) {
    return NextResponse.json(
      { error: "missing api key or cx" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    key: API_KEY,
    cx: CX,
    q,
  });

  const resp = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
  );
  if (!resp.ok) {
    const text = await resp.text();
    return NextResponse.json({ error: text }, { status: resp.status });
  }
  const json = await resp.json();
  return NextResponse.json(json);
}
