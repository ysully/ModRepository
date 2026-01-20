import { useState, useEffect } from "react"
import { Search, TrendingUp, Clock, Star, Download } from "lucide-react"
import Navbar from "../components/Navbar"
import ModCard, { Mod } from "../components/ModCard"
import Footer from "../components/Footer"
import { fetchMods, fetchStatsSummary, type ModItem } from "../api"   // Backend-API

const formatInt = (n: number) => n.toLocaleString("de-DE")

// Mapper: API -> ModCard.Mod (tolerant bei fehlenden Feldern)
function mapDtoToMod(x: ModItem): Mod {
  return {
    id: x.id as any,
    title: x.title,
    description: x.description ?? "",
    imageUrl: x.imageUrl ?? "/images/placeholder.jpg",
    minecraftVersions: x.minecraftVersions ?? [],
    downloads: x.downloads ?? 0,
    popularity: x.popularity ?? 0,
    views: x.views ?? 0,
    favorites: x.favorites ?? 0,
    lastUpdated: x.lastUpdated ?? "",
    author: x.author ?? "unknown",
    category: x.category ?? "unknown",
    jarPath: x.jarPath ?? "",
  }
}

type Summary = { mods: number; downloads: number; views: number; favorites: number }

export default function HomePage() {
  const [mods, setMods] = useState<Mod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"trending" | "new" | "popular" | "downloads">("trending")
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        // Mods + (optional) Summary vom Backend
        const [modsData, summaryData] = await Promise.allSettled([
          fetchMods(),
          fetchStatsSummary(),
        ])

        if (modsData.status === "fulfilled") {
          const mapped = modsData.value.map(mapDtoToMod)
          if (alive) setMods(mapped)
        } else {
          throw modsData.reason
        }

        if (summaryData.status === "fulfilled" && alive) {
          setSummary(summaryData.value)
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Fehler beim Laden")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // Filter + Sortierung
  const filteredMods = mods
    .filter((m) =>
      [m.title, m.description, m.author]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return (b.popularity ?? 0) - (a.popularity ?? 0)
        case "new":
          return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
        case "popular":
          return (b.favorites ?? 0) - (a.favorites ?? 0)
        case "downloads":
          return (b.downloads ?? 0) - (a.downloads ?? 0)
        default:
          return 0
      }
    })

  // Fallback-Statistik (falls summary nicht geladen werden konnte)
  const fallback = {
    mods: mods.length,
    downloads: mods.reduce((s, m) => s + (m.downloads ?? 0), 0),
    views: mods.reduce((s, m) => s + (m.views ?? 0), 0),
    favorites: mods.reduce((s, m) => s + (m.favorites ?? 0), 0),
  }
  const stats = summary ?? fallback
  const mcVersions = new Set(mods.flatMap((m) => m.minecraftVersions ?? [])).size

  // Lade-/Fehlerzustände
  if (loading) return <div className="p-6">Lade Mods…</div>
  if (error)   return <div className="p-6 text-red-500">Fehler: {error}</div>
  if (!mods.length) return <div className="p-6">Keine Mods vorhanden.</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Suchfeld */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Mods nach Name, Beschreibung oder Autor suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 w-full bg-zinc-900 border border-zinc-800 text-white rounded placeholder:text-zinc-500 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Sortierbuttons */}
        <div className="flex items-center gap-2 justify-center flex-wrap mb-6">
          <span className="text-zinc-400 text-sm">Sortieren nach:</span>
          {[
            { id: "trending", label: "Trending", icon: <TrendingUp className="w-4 h-4 mr-1" /> },
            { id: "new", label: "Neu", icon: <Clock className="w-4 h-4 mr-1" /> },
            { id: "popular", label: "Popular", icon: <Star className="w-4 h-4 mr-1" /> },
            { id: "downloads", label: "Downloads", icon: <Download className="w-4 h-4 mr-1" /> },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as any)}
              className={`px-3 py-2 rounded text-sm flex items-center ${
                sortBy === (opt.id as any)
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Statistikbereich */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-1">Gesamtmods</p>
            <p className="text-3xl font-bold text-white">{stats.mods}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-1">Gesamte Downloads</p>
            <p className="text-3xl font-bold text-emerald-500">{formatInt(stats.downloads)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-1">Gesamte Aufrufe</p>
            <p className="text-3xl font-bold text-blue-500">{formatInt(stats.views)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-400 text-sm mb-1">MC-Versionen</p>
            <p className="text-3xl font-bold text-purple-500">{mcVersions}</p>
          </div>
        </div>

        {/* Mod-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMods.map((mod) => (
            <ModCard key={String(mod.id)} mod={mod} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}