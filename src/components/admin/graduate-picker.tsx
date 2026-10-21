"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X, Loader2, EyeOff } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { searchGraduatesAdmin } from "@/app/admin/actions";

type Pick = { id: number; fullName: string; photoUrl: string | null; cohortName: string; countryCode: string; isHidden?: boolean };

/** Search-as-you-type graduate selector. Writes the chosen id into a hidden input `name`. */
export function GraduatePicker({ name, defaultValue, error, onChange }: { name: string; defaultValue?: Pick | null; error?: string; onChange?: (g: Pick | null) => void }) {
  const [selected, setSelected] = useState<Pick | null>(defaultValue ?? null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Pick[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pending, start] = useTransition();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => start(async () => setResults(await searchGraduatesAdmin(q))), 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (g: Pick | null) => {
    setSelected(g);
    onChange?.(g);
    setQ("");
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      {selected ? (
        <div className="flex items-center gap-3 rounded-[8px] border border-green bg-green-tint/50 p-3">
          <Avatar name={selected.fullName} src={selected.photoUrl} countryCode={selected.countryCode} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">{selected.fullName}</p>
            <p className="text-sm text-slate">{selected.cohortName}</p>
          </div>
          <button type="button" onClick={() => choose(null)} className="grid size-8 place-items-center rounded-full hover:bg-white" aria-label="Change graduate">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                choose(results[active]);
              }
            }}
            placeholder="Search the register by name…"
            role="combobox"
            aria-controls={`${name}-listbox`}
            aria-expanded={open}
            aria-autocomplete="list"
            className="h-12 w-full rounded-[6px] border border-line bg-white pl-10 pr-10 outline-none focus:border-green"
          />
          {pending && <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate" />}
        </div>
      )}
      {open && !selected && q.trim().length >= 2 && (
        <ul id={`${name}-listbox`} role="listbox" className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-[8px] border border-line bg-white shadow-xl">
          {results.length === 0 && !pending && <li className="px-4 py-3 text-sm text-slate">No graduate found.</li>}
          {results.map((g, i) => (
            <li key={g.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(g)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${i === active ? "bg-sand" : ""}`}
              >
                <Avatar name={g.fullName} src={g.photoUrl} countryCode={g.countryCode} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{g.fullName}</span>
                  <span className="block text-xs text-slate">{g.cohortName}</span>
                </span>
                {g.isHidden && <EyeOff className="size-4 text-slate" aria-label="Hidden from directory" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1.5 text-sm font-semibold text-red">{error}</p>}
    </div>
  );
}
