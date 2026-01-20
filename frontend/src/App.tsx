import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import UploadPage from "./pages/UploadPage"
import StatsPage from "./pages/StatsPage"
import ModDetailPage from "./pages/ModDetailPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/mods/:id" element={<ModDetailPage />} />
        {/* Optional: 404-Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-zinc-400 text-lg">
              Seite nicht gefunden.
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App