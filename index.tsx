import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FolderPlus, ImagePlus, Plus, Terminal, Trash2, X } from "lucide-react";
import { ImguiPreview } from "@/components/designer/ImguiPreview";
import { HoldablePreview } from "@/components/designer/HoldablePreview";
import { ACCENTS, type Category, type Design, type Item, type ItemType } from "@/components/designer/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Menu Designer — ImGui & Holdable menu builder" },
      { name: "description", content: "Design ImGui-style or holdable mod menus with categories and custom animated backgrounds, then generate template code." },
      { property: "og:title", content: "Menu Designer" },
      { property: "og:description", content: "Design ImGui-style or holdable mod menus and generate template code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

let nid = 100;
const starter = (): Category[] => [
  { id: 1, label: "Main", items: [
    { id: 2, type: "toggle", label: "Enabled Mods", on: true },
    { id: 3, type: "button", label: "Notifications" },
    { id: 4, type: "slider", label: "Speed", value: 40 },
  ] },
  { id: 5, label: "Movement", items: [{ id: 6, type: "toggle", label: "Fly" }, { id: 7, type: "slider", label: "Jump Power", value: 70 }] },
  { id: 8, label: "Visuals", items: [{ id: 9, type: "toggle", label: "ESP" }, { id: 10, type: "mod", label: "Mod Slot" }] },
  { id: 11, label: "Settings", items: [{ id: 12, type: "button", label: "Reset Menu Settings" }, { id: 13, type: "button", label: "Appearance" }] },
];

const ITEM_TYPES: { type: ItemType; label: string }[] = [
  { type: "button", label: "Button" }, { type: "toggle", label: "Toggle" },
  { type: "slider", label: "Slider" }, { type: "mod", label: "Mod slot" },
];

function Index() {
  const [d, setD] = useState<Design>({ title: "My Menu", style: "imgui", accent: ACCENTS[0]!, bgUrl: null, bgOpacity: 0.45, categories: starter() });
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [openId, setOpenId] = useState<number | null>(1);
  const [sel, setSel] = useState<{ cat: number; item?: number } | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setCats = (f: (c: Category[]) => Category[]) => setD((x) => ({ ...x, categories: f(x.categories) }));
  const patchItem = (catId: number, itemId: number, p: Partial<Item>) =>
    setCats((cs) => cs.map((c) => c.id !== catId ? c : { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, ...p } : i) }));

  const addCategory = () => {
    const id = ++nid;
    setCats((cs) => [...cs, { id, label: "New Category", items: [] }]);
    setExpanded((e) => new Set(e).add(id)); setSel({ cat: id }); setOpenId(id);
  };
  const addItem = (catId: number, type: ItemType) => {
    const id = ++nid;
    const label = ITEM_TYPES.find((t) => t.type === type)!.label;
    setCats((cs) => cs.map((c) => c.id !== catId ? c : { ...c, items: [...c.items, { id, type, label: `New ${label}`, ...(type === "slider" ? { value: 50 } : {}) }] }));
    setExpanded((e) => new Set(e).add(catId)); setSel({ cat: catId, item: id }); setOpenId(catId);
  };
  const toggleExp = (id: number) => setExpanded((e) => { const n = new Set(e); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|gif|webp|apng|avif)$/.test(f.type)) { alert("Use a PNG, JPG, GIF, WebP or APNG image."); return; }
    if (d.bgUrl?.startsWith("blob:")) URL.revokeObjectURL(d.bgUrl);
    setD((x) => ({ ...x, bgUrl: URL.createObjectURL(f) }));
  };

  const selCat = d.categories.find((c) => c.id === sel?.cat);
  const selItem = selCat?.items.find((i) => i.id === sel?.item);

  return (
    <div className="min-h-screen bg-background text-foreground scanlines">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-5 w-5 shrink-0 text-primary" />
          <h1 className="truncate text-sm font-bold tracking-wider text-primary">menu_designer<span className="animate-pulse">_</span></h1>
        </div>
        <button onClick={() => setGenOpen(true)} className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground glow transition hover:brightness-110">&gt; generate</button>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        {/* Tree */}
        <aside className="space-y-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">// categories</h2>
            <button onClick={addCategory} className="flex items-center gap-1 rounded-md border border-primary/50 px-2 py-1 text-xs text-primary hover:bg-accent"><FolderPlus className="h-3.5 w-3.5" />add</button>
          </div>
          <ul className="space-y-1">
            {d.categories.map((c) => {
              const open = expanded.has(c.id);
              return (
                <li key={c.id}>
                  <div className={`flex items-center gap-1 rounded-md px-1 py-1 ${sel?.cat === c.id && !sel.item ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                    <button onClick={() => toggleExp(c.id)} className="p-0.5 text-primary" aria-label={open ? "Collapse" : "Expand"}>
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <button onClick={() => { setSel({ cat: c.id }); setOpenId(c.id); }} className="min-w-0 flex-1 truncate text-left text-sm">{c.label}</button>
                    <span className="text-[10px] text-muted-foreground">{c.items.length}</span>
                  </div>
                  {open && (
                    <ul className="ml-5 mt-1 space-y-0.5 border-l border-border pl-2">
                      {c.items.map((i) => (
                        <li key={i.id}>
                          <button onClick={() => { setSel({ cat: c.id, item: i.id }); setOpenId(c.id); }}
                            className={`flex w-full items-center gap-2 rounded px-2 py-0.5 text-left text-xs ${sel?.item === i.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            <span className="text-primary">{i.type[0]}</span><span className="truncate">{i.label}</span>
                          </button>
                        </li>
                      ))}
                      <li className="flex flex-wrap gap-1 pt-1">
                        {ITEM_TYPES.map((t) => (
                          <button key={t.type} onClick={() => addItem(c.id, t.type)} className="flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary"><Plus className="h-2.5 w-2.5" />{t.label}</button>
                        ))}
                      </li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Preview */}
        <main className="space-y-3 rounded-xl border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg border border-border p-0.5 text-xs">
              {(["imgui", "holdable"] as const).map((s) => (
                <button key={s} onClick={() => setD((x) => ({ ...x, style: s }))} className={`rounded-md px-3 py-1 ${d.style === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {ACCENTS.map((a) => (
                <button key={a} onClick={() => setD((x) => ({ ...x, accent: a }))} aria-label={`Accent ${a}`} style={{ background: a }}
                  className={`h-5 w-5 rounded-full ring-offset-2 ring-offset-card ${d.accent === a ? "ring-2 ring-ring" : ""}`} />
              ))}
            </div>
          </div>
          <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border bg-background/60 p-4">
            {d.style === "imgui" ? (
              <ImguiPreview design={d} openId={openId} onOpen={setOpenId}
                onToggle={(cid, it) => patchItem(cid, it.id, { on: !it.on })}
                onSlide={(cid, it, v) => patchItem(cid, it.id, { value: v })} />
            ) : (
              <HoldablePreview design={d} openId={openId} onOpen={setOpenId}
                onToggle={(cid, it) => patchItem(cid, it.id, { on: !it.on })} />
            )}
          </div>
          <p className="text-center text-[11px] text-muted-foreground">{d.style === "imgui" ? "click tabs to open categories" : "tap a category to open it · arrows switch pages"}</p>
        </main>

        {/* Props */}
        <aside className="space-y-4 rounded-xl border border-border bg-card p-3 text-sm">
          <section className="space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">// menu</h2>
            <Field label="title"><input value={d.title} onChange={(e) => setD((x) => ({ ...x, title: e.target.value }))} className="inp" /></Field>
            <Field label="background (png / jpg / gif / animated)">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/apng" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-primary/50 py-1.5 text-xs text-primary hover:bg-accent"><ImagePlus className="h-3.5 w-3.5" />upload</button>
                {d.bgUrl && <button onClick={() => setD((x) => ({ ...x, bgUrl: null }))} className="rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-destructive" aria-label="Remove background"><X className="h-3.5 w-3.5" /></button>}
              </div>
              {d.bgUrl && <img src={d.bgUrl} alt="Background preview" className="mt-2 h-20 w-full rounded-md object-cover" />}
            </Field>
            <Field label={`background opacity ${Math.round(d.bgOpacity * 100)}%`}>
              <input type="range" min={5} max={100} value={Math.round(d.bgOpacity * 100)} onChange={(e) => setD((x) => ({ ...x, bgOpacity: +e.target.value / 100 }))} className="w-full accent-primary" />
            </Field>
          </section>
          <section className="space-y-2 border-t border-border pt-3">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">// selected</h2>
            {!selCat && <p className="text-xs text-muted-foreground">select a category or item</p>}
            {selCat && !selItem && (
              <>
                <Field label="category name"><input value={selCat.label} onChange={(e) => setCats((cs) => cs.map((c) => c.id === selCat.id ? { ...c, label: e.target.value } : c))} className="inp" /></Field>
                <button onClick={() => { setCats((cs) => cs.filter((c) => c.id !== selCat.id)); setSel(null); }} className="del"><Trash2 className="h-3.5 w-3.5" />delete category</button>
              </>
            )}
            {selCat && selItem && (
              <>
                <Field label={`${selItem.type} label`}><input value={selItem.label} onChange={(e) => patchItem(selCat.id, selItem.id, { label: e.target.value })} className="inp" /></Field>
                <button onClick={() => { setCats((cs) => cs.map((c) => c.id !== selCat.id ? c : { ...c, items: c.items.filter((i) => i.id !== selItem.id) })); setSel({ cat: selCat.id }); }} className="del"><Trash2 className="h-3.5 w-3.5" />delete item</button>
              </>
            )}
          </section>
        </aside>
      </div>
      {genOpen && <GenerateModal design={d} onClose={() => setGenOpen(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-[11px] text-muted-foreground">{label}</span>{children}</label>;
}

const LANGS: Record<string, string> = {
  "imgui-cpp": "Dear ImGui C++", "imgui-python": "Python with pyimgui", "html-css-js": "HTML + CSS + vanilla JS",
  react: "React functional component", lua: "Lua (FiveM / Roblox style)", "unity-cs": "Unity C# (holdable VR menu)",
};

function GenerateModal({ design, onClose }: { design: Design; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [lang, setLang] = useState("imgui-cpp");
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setKey(localStorage.getItem("openai_key") ?? ""); }, []);

  const run = async () => {
    if (!key.trim()) { setStatus("! enter your OpenAI API key"); return; }
    if (design.categories.length === 0) { setStatus("! add a category first"); return; }
    localStorage.setItem("openai_key", key.trim());
    const spec = { title: design.title, style: design.style, accentColor: design.accent, hasBackgroundImage: !!design.bgUrl, backgroundOpacity: design.bgOpacity,
      categories: design.categories.map((c) => ({ name: c.label, items: c.items.map((i) => ({ type: i.type, label: i.label })) })) };
    const prompt = `Generate a clean, complete TEMPLATE for a menu from this design JSON:\n${JSON.stringify(spec, null, 2)}\n\nTarget: ${LANGS[lang]}\n- Categories must be openable (tabs for imgui style; a main list that opens each category with a "Back to Main" button and page arrows for holdable style).\n- If hasBackgroundImage, load a background image (support animated GIF frames where the target allows) drawn behind the window at the given opacity.\n- Rounded corners, clean spacing, use the accent color.\n- Template only: "mod" items get a // TODO placeholder. No real cheat logic.\n- Output ONLY code.`;
    setBusy(true); setStatus("> generating..."); setCode("");
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key.trim()}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 3500 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      setCode(String(data.choices?.[0]?.message?.content ?? "").replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim());
      setStatus("> done");
    } catch (e) { setStatus(`! ${e instanceof Error ? e.message : "failed"}`); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl space-y-3 overflow-auto rounded-xl border border-primary/40 bg-card p-4 glow" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="font-bold text-primary">&gt; generate_template</h2><button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button></div>
        <Field label="openai api key (stays in this browser)"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-..." className="inp" /></Field>
        <Field label="target"><select value={lang} onChange={(e) => setLang(e.target.value)} className="inp">{Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <button onClick={run} disabled={busy} className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy ? "running..." : "run"}</button>
        {status && <p className={`text-xs ${status.startsWith("!") ? "text-destructive" : "text-primary"}`}>{status}</p>}
        {code && (<>
          <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-background p-3 text-[11px]">{code}</pre>
          <button onClick={() => navigator.clipboard.writeText(code).then(() => setStatus("> copied"))} className="rounded-md border border-border px-3 py-1 text-xs">copy</button>
        </>)}
      </div>
    </div>
  );
}
