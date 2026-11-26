import { useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Design, Item } from "./types";

type Props = {
  design: Design;
  openId: number | null;
  onOpen: (id: number | null) => void;
  onToggle: (catId: number, item: Item) => void;
};
const PER_PAGE = 6;

export function HoldablePreview({ design, openId, onOpen, onToggle }: Props) {
  const [page, setPage] = useState(0);
  const cat = design.categories.find((c) => c.id === openId);
  const rows: { key: string; label: string; active?: boolean; action: () => void }[] = cat
    ? [
        { key: "back", label: "‹ Back to Main", action: () => { onOpen(null); setPage(0); } },
        ...cat.items.map((it) => ({
          key: String(it.id),
          label: it.label + (it.type === "slider" ? ` : ${it.value ?? 50}` : ""),
          active: it.type === "toggle" && !!it.on,
          action: () => it.type === "toggle" && onToggle(cat.id, it),
        })),
      ]
    : design.categories.map((c) => ({ key: String(c.id), label: c.label, action: () => { onOpen(c.id); setPage(0); } }));
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const p = Math.min(page, pages - 1);
  const shown = rows.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE);
  const vars = { "--a": design.accent } as CSSProperties;
  const side = "flex w-9 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--a)_45%,black)] transition hover:bg-[color-mix(in_oklab,var(--a)_70%,black)] disabled:opacity-30";

  return (
    <div style={vars} className="flex w-full max-w-sm flex-col gap-2 font-mono text-sm text-white">
      <div className="rounded-2xl bg-[color-mix(in_oklab,var(--a)_55%,black)] py-2 text-center font-semibold shadow-lg">Disconnect</div>
      <div className="flex gap-2">
        <button className={side} disabled={p === 0} onClick={() => setPage(p - 1)} aria-label="Previous page"><ChevronLeft className="h-5 w-5" /></button>
        <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-[color-mix(in_oklab,var(--a)_30%,black)] p-3 shadow-[0_10px_40px_color-mix(in_oklab,var(--a)_30%,transparent)]">
          {design.bgUrl && <img src={design.bgUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: design.bgOpacity }} />}
          <div className="relative">
            <div className="mb-2 truncate text-center font-bold">{cat ? cat.label : design.title || "Menu"} <span className="opacity-60">| ({p + 1})</span></div>
            <div className="space-y-1.5">
              {shown.length === 0 && <p className="py-6 text-center opacity-60">Nothing here yet</p>}
              {shown.map((r) => (
                <button key={r.key} onClick={r.action}
                  className={`block w-full truncate rounded-xl px-3 py-2 text-center transition active:scale-[0.98] ${r.active ? "bg-[var(--a)] text-black" : "bg-[color-mix(in_oklab,var(--a)_50%,black)] hover:bg-[color-mix(in_oklab,var(--a)_70%,black)]"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className={side} disabled={p >= pages - 1} onClick={() => setPage(p + 1)} aria-label="Next page"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
