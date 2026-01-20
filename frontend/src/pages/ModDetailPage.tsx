// src/pages/ModDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { ArrowLeft, Download, Eye, Heart, Calendar, TrendingUp } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { fetchModById, downloadMod, recordView, setFavorite, type ModItem } from "../api"

export default function ModDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mod, setMod] = useState<ModItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // lokaler Toggle-Status fürs Herz (nur UI; echte Zählung macht der Server)
  const [favOn, setFavOn] = useState<boolean>(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!id) throw new Error("Keine ID übergeben")
        const data = await fetchModById(id)
        if (!data) throw new Error("Mod nicht gefunden")

        if (alive) {
          setMod(data)
          // optional: lokalen Favoritenstatus aus localStorage wiederherstellen
          const key = `fav:${String(data.id)}`
          setFavOn(localStorage.getItem(key) === "1")

          // Views++ auf dem Server (Fehler ignorieren) und Anzeige lokal +1
          recordView(String(data.id))
            .catch(() => {})
            .finally(() => {
              if (!alive) return
              setMod(prev => prev ? { ...prev, views: (prev.views ?? 0) + 1 } : prev)
            })
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? "Fehler beim Laden")
          setMod(null)
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  if (loading) return <p className="text-center text-zinc-400 py-20">Wird geladen...</p>
  if (error)   return <p className="text-center text-red-500 py-20">Fehler: {error}</p>
  if (!mod)    return <p className="text-center text-zinc-400 py-20">Mod nicht gefunden.</p>

  // Werte absichern
  const image = mod.imageUrl || "/images/placeholder.jpg"
  const cat = mod.category || "Mod"
  const title = mod.title
  const shortDesc = mod.description || ""
  const longDesc = (mod as any).longDescription || mod.description || ""
  const versions = Array.isArray(mod.minecraftVersions) ? mod.minecraftVersions : []
  const author = mod.author || "unknown"
  const views = (mod.views ?? 0).toLocaleString("de-DE")
  const downloads = (mod.downloads ?? 0).toLocaleString("de-DE")
  const favorites = (mod.favorites ?? 0).toLocaleString("de-DE")
  const popularity = mod.popularity ?? 0
  const lastUpdated = mod.lastUpdated || "—"

  const handleDownload = async () => {
    // Startet Download via Backend (Server zählt mit)
    downloadMod(String(mod.id))
    // Anzeige optimistisch +1
    setMod(prev => prev ? { ...prev, downloads: (prev.downloads ?? 0) + 1 } : prev)
  }

  const toggleFavorite = async () => {
    const next = !favOn
    setFavOn(next)
    // lokal den Counter anpassen (optimistisch)
    setMod(prev => {
      if (!prev) return prev
      const newFav = Math.max(0, (prev.favorites ?? 0) + (next ? 1 : -1))
      return { ...prev, favorites: newFav }
    })
    // Server call
    try {
      await setFavorite(String(mod.id), next)
      // persistenter UI-Status (nur lokal, pro Gerät/Browser)
      localStorage.setItem(`fav:${String(mod.id)}`, next ? "1" : "0")
    } catch {
      // rollback, falls der Server Fehler wirft
      setFavOn(!next)
      setMod(prev => {
        if (!prev) return prev
        const newFav = Math.max(0, (prev.favorites ?? 0) + (next ? -1 : +1))
        return { ...prev, favorites: newFav }
      })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </Button>
        <h1 className="flex-1 text-center text-xl font-semibold">Mod-Details</h1>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="relative mb-10">
          <img
            src={image}
            alt={title}
            className="w-full h-[400px] object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl"></div>

          <div className="absolute bottom-6 left-8 right-8">
            <Badge className="bg-emerald-600 text-white text-sm mb-3 px-3 py-1 rounded-full">
              {cat}
            </Badge>
            <h1 className="text-4xl font-bold">{title}</h1>
            <p className="text-lg text-zinc-300 mt-2">{shortDesc}</p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-3">Über diesen Mod</h2>
              <p className="text-zinc-300 leading-relaxed">
                {longDesc || "Keine ausführliche Beschreibung vorhanden."}
              </p>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-3">Unterstützte Minecraft-Versionen</h2>
              <div className="flex flex-wrap gap-2">
                {versions.length ? (
                  versions.map((v, i) => (
                    <span
                      key={i}
                      className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-sm"
                    >
                      {v}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 text-sm">Keine Versionsangaben</span>
                )}
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-semibold mb-3">Informationen zum Autor</h2>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                  {author[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold">{author}</p>
                  <p className="text-sm text-zinc-400">Mod-Entwickler</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-emerald-700 text-white rounded-2xl p-6 text-center shadow-md">
              <h3 className="text-lg font-semibold mb-3">Mod herunterladen</h3>
              <Button
                className="w-full bg-emerald-200 text-emerald-900 hover:bg-emerald-300 font-semibold"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" /> Jetzt herunterladen
              </Button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Statistiken</h3>

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  className={`flex-1 border-zinc-700 ${favOn ? "bg-red-500/20 text-red-400" : "text-zinc-300 hover:bg-zinc-800"}`}
                  onClick={toggleFavorite}
                  title={favOn ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {favOn ? "Entfernen" : "Favorisieren"}
                </Button>
              </div>

              <ul className="space-y-2 text-zinc-300">
                <li><Eye className="inline w-4 h-4 mr-2 text-blue-400" /> <strong>{views}</strong> Aufrufe</li>
                <li><Download className="inline w-4 h-4 mr-2 text-green-400" /> <strong>{downloads}</strong> Downloads</li>
                <li><Heart className="inline w-4 h-4 mr-2 text-red-500" /> <strong>{(mod.favorites ?? 0).toLocaleString("de-DE")}</strong> Favoriten</li>
                <li><TrendingUp className="inline w-4 h-4 mr-2 text-purple-400" /> Beliebtheit: <strong>{popularity}%</strong></li>
                <li><Calendar className="inline w-4 h-4 mr-2 text-zinc-400" /> Letztes Update: <strong>{lastUpdated}</strong></li>
              </ul>
            </div>

            <div className="bg-blue-900/40 border border-blue-700 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Installationsanleitung</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Lade die passende Version für deine Minecraft-Installation herunter.
                Lege die .jar-Datei in den „mods“-Ordner deines Minecraft-Verzeichnisses.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}