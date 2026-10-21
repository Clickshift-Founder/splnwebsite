"use client";

import { useState } from "react";
import { Eye, PenLine } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { Textarea } from "@/components/ui/form";
import { cn } from "@/lib/brand";

/** Markdown textarea with Write / Preview tabs and a live word count. */
export function MarkdownEditor({ name, defaultValue = "", rows = 22, placeholder }: { name: string; defaultValue?: string; rows?: number; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="overflow-hidden rounded-[8px] border border-line focus-within:border-green">
      <div className="flex items-center justify-between border-b border-line bg-sand px-2">
        <div className="flex">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold", tab === t ? "text-ink" : "text-slate hover:text-ink")}
            >
              {t === "write" ? <PenLine className="size-4" /> : <Eye className="size-4" />}
              {t === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>
        <span className="px-3 text-xs font-semibold text-slate">
          {words.toLocaleString("en-GB")} words · Markdown supported
        </span>
      </div>
      <Textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={cn("rounded-none border-0 font-[inherit] focus:ring-0", tab === "preview" && "hidden")}
      />
      {tab === "preview" && (
        <div className="min-h-[24rem] bg-white p-6">{value ? <Markdown>{value}</Markdown> : <p className="text-slate">Nothing to preview yet.</p>}</div>
      )}
    </div>
  );
}
