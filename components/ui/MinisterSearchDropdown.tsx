"use client";

import { useState, useEffect, useRef } from "react";
import { searchMinisterTags } from "@/lib/api/ministers";
import type { TagResult } from "@/lib/api/types";

interface Props {
  onSelect: (minister: TagResult) => void;
}

export function MinisterSearchDropdown({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TagResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMinisterTags(query);
        setResults(data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(m: TagResult) {
    onSelect(m);
    setQuery("");
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ministers…"
        className="border border-gray-300 rounded-full px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0169CC]/30 w-48"
      />
      {loading && (
        <div className="absolute right-3 top-2 w-4 h-4 border-2 border-[#0169CC] border-t-transparent rounded-full animate-spin" />
      )}
      {open && results.length > 0 && (
        <ul className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => handleSelect(m)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5"
              >
                <span className="text-sm font-medium text-gray-800">{m.name}</span>
                <span className="text-xs text-[#0169CC]">{m.tag}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
