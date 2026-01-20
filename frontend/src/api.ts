const API_BASE = ''; // dank Vite-Proxy leer lassen

export type ModItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  minecraftVersions?: string[];
  downloads?: number;
  popularity?: number;
  jarPath?: string;
  lastUpdated?: string;
  views?: number;
  favorites?: number;
  author?: string;
  category?: string;
};

// 🧩 1) Alle Mods laden
export async function fetchMods(): Promise<ModItem[]> {
  const res = await fetch(`${API_BASE}/api/mods`);
  if (!res.ok) throw new Error(`GET /api/mods -> ${res.status}`);
  return res.json();
}

// 📊 2) Gesamtstatistik: Top Mods + Summe Downloads
export async function fetchStatsTop(): Promise<{
  downloadsTotal: number;
  mostDownloaded: { title: string; downloads: number }[];
}> {
  const res = await fetch(`${API_BASE}/api/stats/top`);
  if (!res.ok) throw new Error(`GET /api/stats/top -> ${res.status}`);
  return res.json();
}

// 🧱 3) Beliebteste Mods pro Minecraft-Version
export async function fetchStatsByVersion(
  top = 5
): Promise<Record<string, { title: string; downloads: number }[]>> {
  const res = await fetch(`${API_BASE}/api/stats/byVersion?top=${top}`);
  if (!res.ok) throw new Error(`GET /api/stats/byVersion -> ${res.status}`);
  return res.json();
}

// 🔍 4) Einzelne Mod aus Cache (lokal filtern)
export async function fetchModById(id: string): Promise<ModItem | null> {
  const mods = await fetchMods();
  return mods.find((m) => String(m.id) === String(id)) ?? null;
}

// 💾 5) Download einer Mod (öffnet Browser-Download)
export function downloadMod(id: string) {
  window.location.href = `${API_BASE}/api/mods/${id}/download`;
}

export async function recordView(id: string | number) {
  await fetch(`/api/mods/${id}/view`, { method: 'POST' });
}

export async function setFavorite(id: string | number, on: boolean) {
  await fetch(`/api/mods/${id}/favorite?on=${on ? 'true' : 'false'}`, { method: 'POST' });
}

export async function fetchStatsSummary(): Promise<{
  mods: number; downloads: number; views: number; favorites: number;
}> {
  const r = await fetch('/api/stats/summary');
  if (!r.ok) throw new Error('Failed to load /api/stats/summary');
  return r.json();
}