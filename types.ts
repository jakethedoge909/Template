export type ItemType = "button" | "toggle" | "slider" | "mod";
export type Item = { id: number; type: ItemType; label: string; on?: boolean; value?: number };
export type Category = { id: number; label: string; items: Item[] };
export type MenuStyle = "imgui" | "holdable";
export type Design = {
  title: string;
  style: MenuStyle;
  accent: string;
  bgUrl: string | null;
  bgOpacity: number;
  categories: Category[];
};
export const ACCENTS = ["#e0457b", "#39ff88", "#38bdf8", "#a78bfa", "#f59e0b"];
