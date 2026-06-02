"use client";

import { useState, useEffect, useRef } from "react";
import { searchMinisterTags } from "@/lib/api/ministers";
import type { TagResult } from "@/lib/api/types";
import type { Department } from "@/lib/api/departments";

interface MentionItem {
  type: "department" | "minister";
  id: number;
  name: string;
  tag?: string;
}

interface Props {
  query: string;
  departments: Department[];
  onSelect: (type: "department" | "minister", item: { id: number; name: string; tag?: string }) => void;
  onClose: () => void;
}

export function MentionDropdown({ query, departments, onSelect, onClose }: Props) {
  const [ministers, setMinisters] = useState<TagResult[]>([]);
  const [loadingMinisters, setLoadingMinisters] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  );

  const allItems: MentionItem[] = [
    ...filteredDepts.map((d) => ({ type: "department" as const, id: d.id, name: d.name })),
    ...ministers.map((m) => ({ type: "minister" as const, id: m.id, name: m.name, tag: m.tag })),
  ];

  // Use refs so the stable keydown handler always sees latest values
  const allItemsRef = useRef(allItems);
  const activeIndexRef = useRef(activeIndex);
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  allItemsRef.current = allItems;
  activeIndexRef.current = activeIndex;
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoadingMinisters(true);
      try {
        const data = await searchMinisterTags(query);
        setMinisters(data);
      } catch {
        setMinisters([]);
      } finally {
        setLoadingMinisters(false);
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filteredDepts.length, ministers.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const items = allItemsRef.current;
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const item = items[activeIndexRef.current];
        if (item) {
          e.preventDefault();
          onSelectRef.current(item.type, { id: item.id, name: item.name, tag: item.tag });
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isEmpty = allItems.length === 0 && !loadingMinisters;
  if (isEmpty) return null;

  return (
    // onMouseDown prevent default so clicking inside doesn't blur the textarea
    <div
      className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto"
      onMouseDown={(e) => e.preventDefault()}
    >
      {filteredDepts.length > 0 && (
        <div>
          <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Departments
          </p>
          {filteredDepts.map((dept, i) => (
            <button
              key={`dept-${dept.id}`}
              onClick={() => onSelect("department", { id: dept.id, name: dept.name })}
              className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors ${
                activeIndex === i ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <span className="text-sm font-medium text-gray-800">{dept.name}</span>
              {dept.minister && (
                <span className="text-xs text-gray-400">Minister: {dept.minister.name}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {(ministers.length > 0 || loadingMinisters) && (
        <div className={filteredDepts.length > 0 ? "border-t border-gray-100" : ""}>
          <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Ministers
          </p>
          {loadingMinisters ? (
            <div className="px-4 py-3 flex justify-center">
              <div className="w-4 h-4 border-2 border-[#C92A2A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            ministers.map((m, i) => (
              <button
                key={`minister-${m.id}`}
                onClick={() => onSelect("minister", { id: m.id, name: m.name, tag: m.tag })}
                className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors ${
                  activeIndex === filteredDepts.length + i ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-medium text-gray-800">{m.name}</span>
                <span className="text-xs text-[#C92A2A]">{m.tag}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
