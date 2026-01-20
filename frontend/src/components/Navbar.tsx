import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const { pathname } = useLocation()

  // Hilfsfunktion zum Erstellen der Navigationsbuttons
  const navBtn = (to: string, label: string) => (
    <Link to={to}>
      <button
        className={`px-4 py-2 rounded-md ${
          pathname === to
            ? "bg-emerald-600 text-white"
            : "text-zinc-300 hover:text-white hover:bg-zinc-800"
        }`}
      >
        {label}
      </button>
    </Link>
  )

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo und Titel */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Minecraft Mods</h1>
            <p className="text-xs text-zinc-400">Repository & Downloads</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-2">
          {navBtn("/", "Home")}
          {navBtn("/upload", "Upload Mod")}
          {navBtn("/stats", "Statistiken")}
        </nav>
      </div>
    </header>
  )
}
