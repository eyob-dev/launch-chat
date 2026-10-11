"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, type Country } from "@/data/countries";

interface Props {
  value: string; // ISO2
  onChange: (iso2: string) => void;
  id?: string;
}

/** Normalize text for diacritic-insensitive search. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(country: Country, query: string): boolean {
  const q = normalize(query).replace(/^\+/, "").trim();
  if (!q) return true;
  if (country.name.toLowerCase().startsWith(q)) return true;
  if (normalize(country.name).includes(q)) return true;
  if (country.iso2.toLowerCase() === q) return true;
  if (country.iso3?.toLowerCase() === q) return true;
  if (country.callingCode.startsWith(q)) return true;
  if (country.altNames.some((n) => normalize(n).includes(q))) return true;
  return false;
}

export function CountrySelector({ value, onChange, id = "country" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === value) ?? COUNTRIES[0],
    [value]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES;
    return COUNTRIES.filter((c) => matches(c, query));
  }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const openList = () => {
    setActiveIndex(0);
    setOpen(true);
    // Focus search field shortly after opening for keyboard users.
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  // Keep the active option in view.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const choose = (iso2: string) => {
    onChange(iso2);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[activeIndex];
      if (c) choose(c.iso2);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Country calling code
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 text-left shadow-sm transition hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
      >
        <span aria-hidden="true" className="text-2xl leading-none">
          {selected.flag}
        </span>
        <span className="flex-1 truncate text-base text-gray-900 dark:text-gray-100">
          {selected.name}
        </span>
        <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
          {selected.displayCode}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="relative border-b border-gray-100 p-2 dark:border-gray-700">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search country, code, or ISO..."
              aria-label="Search country"
              className="h-11 w-full rounded-lg bg-gray-50 pl-9 pr-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <ul ref={listRef} role="listbox" tabIndex={-1} className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No countries match
              </li>
            )}
            {filtered.map((c, idx) => {
              const isSelected = c.iso2 === value;
              return (
                <li
                  key={c.iso2}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => choose(c.iso2)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm ${idx === activeIndex ? "bg-primary-50 dark:bg-gray-700" : ""}`}
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    {c.flag}
                  </span>
                  <span className="flex-1 truncate text-gray-900 dark:text-gray-100">
                    {c.name}
                  </span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {c.iso2}
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {c.displayCode}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary-600" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
