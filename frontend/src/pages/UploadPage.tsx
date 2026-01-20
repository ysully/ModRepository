// src/pages/UploadPage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, ArrowLeft, Image as ImageIcon, FileArchive } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

export default function UploadPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    versions: "",
  })
  const [fileJar, setFileJar] = useState<File | null>(null)
  const [fileImage, setFileImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Pflicht: JAR vorhanden
    if (!fileJar) {
      setError("Bitte eine Mod-Datei (.jar) auswählen.")
      return
    }
    // einfacher Endungscheck
    const lower = fileJar.name.toLowerCase()
    if (!lower.endsWith(".jar")) {
      setError("Die Mod-Datei muss eine .jar sein.")
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("author", form.author)
      fd.append("category", form.category)
      fd.append("description", form.description)
      if (form.versions.trim()) fd.append("versions", form.versions)
      fd.append("fileJar", fileJar)
      if (fileImage) fd.append("fileImage", fileImage)

      const res = await fetch("/api/mods", { method: "POST", body: fd })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(`POST /api/mods -> ${res.status} ${txt}`)
      }

      navigate("/")
    } catch (err: any) {
      setError(err?.message ?? "Upload fehlgeschlagen")
    } finally {
      setSubmitting(false)
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
        <h1 className="flex-1 text-center text-xl font-semibold">Neuen Mod hochladen</h1>
      </header>

      {/* Inhalt */}
      <main className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6 text-center">Neuen Mod hinzufügen</h2>
        <p className="text-zinc-400 text-center mb-10">
          JAR-Datei ist <span className="text-emerald-400 font-semibold">erforderlich</span>. Bild und Versionen sind optional.
        </p>

        <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-md space-y-6">
          {error && (
            <div className="p-3 rounded border border-red-600 bg-red-950 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-zinc-300 mb-2">Mod-Titel *</label>
            <Input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="z. B. OptiFine HD"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-2">Autor *</label>
              <Input
                name="author"
                value={form.author}
                onChange={onChange}
                placeholder="z. B. sp614x"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-2">Kategorie *</label>
              <Input
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="z. B. Performance, Utility …"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 mb-2">Kurzbeschreibung *</label>
            <Textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Kurze Beschreibung des Mods"
              required
            />
          </div>

          {/* Minecraft-Versionen (optional) */}
          <div>
            <label className="block text-zinc-300 mb-2">Minecraft-Versionen (optional)</label>
            <Input
              name="versions"
              value={form.versions}
              onChange={onChange}
              placeholder="z. B. 1.20.4, 1.20.1, 1.19.4"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Mehrere Versionen durch Komma, Semikolon oder Leerzeichen trennen.
            </p>
          </div>

          {/* Dateien */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-2">Mod-JAR *</label>
              <div className="flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-zinc-400" />
                <input
                  type="file"
                  accept=".jar"
                  required
                  onChange={e => setFileJar(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:hover:bg-zinc-700"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">Nur .jar Dateien.</p>
            </div>

            <div>
              <label className="block text-zinc-300 mb-2">Bild (optional)</label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFileImage(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:hover:bg-zinc-700"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg"
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              {submitting ? "Lädt hoch…" : "Hochladen"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}