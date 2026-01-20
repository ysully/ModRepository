import { Link } from "react-router-dom"
import { Eye, Download, Heart } from "lucide-react"

export type Mod = {
  id: number
  title: string
  description: string
  imageUrl: string
  minecraftVersions: string[]
  popularity: number
  downloads: number
  views: number
  favorites: number
  lastUpdated: string
  author: string
  category: string
}

// Funktion zur Formatierung von großen Zahlen (z. B. 1200 → 1.2k)
const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString())

export default function ModCard({ mod }: { mod: Mod }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-emerald-600 transition-all rounded-2xl overflow-hidden">
      {/* Bild + Kategorie-Badge */}
      <div className="relative">
        <img
          src={mod.imageUrl}
          alt={mod.title}
          className="w-full h-56 md:h-52 lg:h-56 object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {mod.category}
        </span>
      </div>

      {/* Textbereich */}
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-white mb-2">{mod.title}</h2>
        <p className="text-zinc-300 line-clamp-2 mb-4">{mod.description}</p>

        {/* Minecraft-Versionen */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mod.minecraftVersions.map((v) => (
            <span
              key={v}
              className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-full px-3 py-1"
            >
              {v}
            </span>
          ))}
        </div>

        {/* Statistiken im Mod-Kasten */}
        <div className="flex items-center gap-6 text-zinc-400 text-sm mb-4">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" /> {k(mod.views)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" /> {k(mod.downloads)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" /> {k(mod.favorites)}
          </span>
        </div>

        {/* Autor und Datum */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>von {mod.author}</span>
          <span>{new Date(mod.lastUpdated).toLocaleDateString("de-DE")}</span>
        </div>

        {/* Button */}
        <Link to={`/mods/${mod.id}`}>
          <button className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-md text-lg">
            Details anzeigen
          </button>
        </Link>
      </div>
    </div>
  )
}
