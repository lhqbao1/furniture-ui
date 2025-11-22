"use client";
import React, { useState } from "react";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q) return;
    setLoading(true);
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const j = await r.json();
    setLoading(false);
    setResults(j.items ?? []);
  }

  return (
    <div>
      <form onSubmit={onSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div>Loading…</div>}
      <ul>
        {results.map((it: any) => (
          <li key={it.cacheId || it.link}>
            <a
              href={it.link}
              target="_blank"
              rel="noreferrer"
            >
              {it.title}
            </a>
            <div dangerouslySetInnerHTML={{ __html: it.htmlSnippet ?? "" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
