import type { CSSProperties } from "react";
import type { Design, Item } from "./types";

type Props = {
  design: Design;
  openId: number | null;
  onOpen: (id: number) => void;
  onToggle: (catId: number, item: Item) => void;
  onSlide: (catId: number, item: Item, v: number) => void;
};

export function ImguiPreview({ design, openId, onOpen, onToggle, onSlide }: Props) {
  const cat = design.categories.find((c) => c.id === openId) ?? design.categories[0];
  const vars = { "--a": design.accent } as CSSProperties;
  return (
    <div style={vars} className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-[color-mix(in_oklab,var(--a)_70%,black)] bg-[color-mix(in_oklab,var(--a)_22%,black)] font-mono text-[12px] text-[color-mix(in_oklab,var(--a)_15%,white)] shadow-[0_0_30px_color-mix(in_oklab,var(--a)_35%,transparent)]">
      {design.bgUrl ? (
        <img src={design.bgUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: design.bgOpacity }} />
      ) : (
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-radial-gradient(circle at 70% 45%, transparent 0 10px, color-mix(in oklab, var(--a) 60%, transparent) 10px 11px)" }} />
      )}
      <div className="relative">
        <div className="flex items-center justify-between bg-[color-mix(in_oklab,var(--a)_55%,black)] px-3 py-1.5">
          <span className="truncate font-bold">{design.title || "Menu"}</span>
          <span className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--a)]" /><i className="h-2.5 w-2.5 rounded-sm bg-[color-mix(in_oklab,var(--a)_50%,white)]" /></span>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-[color-mix(in_oklab,var(--a)_60%,black)] px-2 pt-1.5">
          {design.categories.map((c) => (
            <button key={c.id} onClick={() => onOpen(c.id)}
              className={`shrink-0 rounded-t px-3 py-1 transition-colors ${c.id === cat?.id ? "bg-[var(--a)] text-black" : "bg-[color-mix(in_oklab,var(--a)_35%,black)] hover:bg-[color-mix(in_oklab,var(--a)_60%,black)]"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="min-h-56 space-y-1.5 p-3">
          {!cat && <p className="opacity-60">Add a category to start.</p>}
          {cat?.items.length === 0 && <p className="opacity-60">Empty category — add items.</p>}
          {cat?.items.map((it) => (
            <div key={it.id} className="flex items-center gap-2 rounded px-2 py-1 bg-black/20">
              {it.type === "toggle" && (
                <button onClick={() => onToggle(cat.id, it)} className={`h-4 w-4 shrink-0 rounded-sm border border-[var(--a)] ${it.on ? "bg-[var(--a)]" : ""}`} aria-label={`Toggle ${it.label}`} />
              )}
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.type === "slider" && (
                <input type="range" min={0} max={100} value={it.value ?? 50} onChange={(e) => onSlide(cat.id, it, +e.target.value)} className="w-32" style={{ accentColor: design.accent }} />
              )}
              {it.type === "button" && <span className="rounded bg-[var(--a)] px-2 text-black">run</span>}
              {it.type === "mod" && <span className="opacity-60">[mod]</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
