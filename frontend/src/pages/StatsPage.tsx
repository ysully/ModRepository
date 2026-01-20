// src/pages/StatsPage.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { fetchMods, fetchStatsTop, type ModItem } from "../api"

type EnrichedTop = {
  rank: number
  id?: string
  title: string
  category: string
  versions: string[]
  downloads: number
  views?: number
  favorites?: number
  popularity?: number
  color: string
}

type VersionAgg = {
  version: string
  count: number
  totalDownloads: number
  avgPopularity: number
}

const fmt = (n?: number) => (n ?? 0).toLocaleString("de-DE")

export default function StatsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mods, setMods] = useState<ModItem[]>([])
  const [downloadsTotal, setDownloadsTotal] = useState<number>(0)
  const [mostDownloaded, setMostDownloaded] = useState<{ title: string; downloads: number }[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [modsData, topData] = await Promise.all([
          fetchMods(),
          fetchStatsTop(), // { downloadsTotal, mostDownloaded: [{title, downloads}] }
        ])
        if (!alive) return
        setMods(modsData)
        setDownloadsTotal(topData.downloadsTotal ?? 0)
        setMostDownloaded(topData.mostDownloaded ?? [])
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Fehler beim Laden")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Map für schnellen Lookup per Titel (Backend-/JSON-Top enthält keine IDs)
  const modByTitle = useMemo(() => {
    const m = new Map<string, ModItem>()
    mods.forEach((x) => m.set(x.title, x))
    return m
  }, [mods])

  // Top-Liste anreichern (Kategorie, Versions, Views/Favs) – Match per Titel
  const enrichedTop: EnrichedTop[] = useMemo(() => {
    return mostDownloaded.map((t, idx) => {
      const m = modByTitle.get(t.title)
      const versions = m?.minecraftVersions ?? []
      return {
        rank: idx + 1,
        id: m?.id ? String(m.id) : undefined,
        title: t.title,
        category: m?.category ?? "—",
        versions,
        downloads: t.downloads,
        views: m?.views,
        favorites: m?.favorites,
        popularity: m?.popularity,
        color:
          idx === 0 ? "bg-yellow-400" :
          idx === 1 ? "bg-gray-400"  :
          idx === 2 ? "bg-orange-500" : "bg-gray-500",
      }
    })
  }, [mostDownloaded, modByTitle])

  // Versions-Aggregate aus allen Mods berechnen (Count, Sum Downloads, Avg Popularity)
  const byVersion: VersionAgg[] = useMemo(() => {
    const agg = new Map<string, { count: number; sumDownloads: number; sumPopularity: number; popCount: number }>()
    for (const m of mods) {
      const vers = m.minecraftVersions ?? []
      for (const v of vers) {
        if (!agg.has(v)) agg.set(v, { count: 0, sumDownloads: 0, sumPopularity: 0, popCount: 0 })
        const a = agg.get(v)!
        a.count += 1
        a.sumDownloads += m.downloads ?? 0
        if (typeof m.popularity === "number") {
          a.sumPopularity += m.popularity
          a.popCount += 1
        }
      }
    }
    const arr: VersionAgg[] = Array.from(agg.entries()).map(([version, a]) => ({
      version,
      count: a.count,
      totalDownloads: a.sumDownloads,
      avgPopularity: a.popCount ? Math.round((a.sumPopularity / a.popCount) * 10) / 10 : 0,
    }))
    // sortiere nach totalDownloads DESC
    arr.sort((x, y) => y.totalDownloads - x.totalDownloads)
    return arr
  }, [mods])

  // Für die Balkenbreite
  const versionMax = useMemo(
    () => Math.max(1, ...byVersion.map((v) => v.totalDownloads)),
    [byVersion]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Lade Statistiken…
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-red-500 flex items-center justify-center">
        Fehler: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 text-zinc-300 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-10">Statistics & Analytics</h1>

        {/* Top Mods */}
        <section>
          <h2 className="text-2xl font-bold flex items-center mb-2">
            <TrendingUp className="w-6 h-6 mr-2 text-yellow-400" />
            Top Mods
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Gesamte Downloads: <span className="text-emerald-400 font-semibold">{fmt(downloadsTotal)}</span>
          </p>

          {!enrichedTop.length ? (
            <div className="text-zinc-400">Keine Top-Daten vorhanden.</div>
          ) : (
            <div className="space-y-6">
              {enrichedTop.map((mod, i) => (
                <div
                  key={`${mod.title}-${i}`}
                  className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${mod.color} rounded-full flex items-center justify-center text-black font-bold text-xl`}>
                      {mod.rank}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{mod.title}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge className="bg-emerald-600 text-white text-xs">{mod.category}</Badge>
                        {mod.versions.slice(0, 4).map((v, i2) => (
                          <Badge key={i2} variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-center text-sm text-zinc-300">
                    <div>
                      <p className="text-zinc-400">Downloads</p>
                      <p className="text-green-400 font-semibold">{fmt(mod.downloads)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Views</p>
                      <p className="text-blue-400 font-semibold">{fmt(mod.views)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Favorites</p>
                      <p className="text-red-500 font-semibold">{fmt(mod.favorites)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Popularity</p>
                      <p className="text-purple-400 font-semibold">{(mod.popularity ?? 0) + "%"}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      // Wenn wir die ID über Titel-Match haben, zu /mods/:id
                      if (mod.id) navigate(`/mods/${mod.id}`)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!mod.id}
                    title={!mod.id ? "Kein direkter Link verfügbar (ID unbekannt)" : ""}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Version Statistics */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold mb-6 text-purple-400 flex items-center gap-2">
            Version Statistics
          </h2>

          {!byVersion.length ? (
            <div className="text-zinc-400">Keine Versionsdaten vorhanden.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {byVersion.map((v) => (
                <div key={v.version} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="bg-purple-600 p-3 font-semibold">Minecraft {v.version}</div>
                  <div className="p-5 space-y-3 text-zinc-300">
                    <p className="text-lg font-semibold text-purple-400">
                      Mod Count: <span className="text-white">{fmt(v.count)}</span>
                    </p>
                    <p className="text-lg font-semibold text-green-400">
                      Total Downloads: <span className="text-white">{fmt(v.totalDownloads)}</span>
                    </p>
                    <p className="text-lg font-semibold text-blue-400">
                      Avg Popularity: <span className="text-white">{v.avgPopularity.toLocaleString("de-DE")}%</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Downloads Comparison (Balken basierend auf totalDownloads) */}
        {byVersion.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold mb-6 text-emerald-500 flex items-center gap-2">
              Downloads Comparison
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              {byVersion.map((v) => {
                const pct = Math.round((v.totalDownloads / versionMax) * 100)
                return (
                  <div key={v.version}>
                    <p className="flex justify-between text-zinc-300 text-sm mb-2">
                      <span>Minecraft {v.version}</span>
                      <span>{fmt(v.totalDownloads)} Downloads</span>
                    </p>
                    <div className="bg-zinc-800 rounded-full h-6 w-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full text-xs flex items-center justify-end pr-2 font-bold text-white rounded-full"
                        style={{ width: `${pct}%` }}
                      >
                        {pct}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}