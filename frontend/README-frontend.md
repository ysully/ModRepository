# 🧱 Minecraft Mods Repository – Frontend

Dieses Projekt wurde mit **React**, **TypeScript**, **Vite** und **TailwindCSS** entwickelt, 
um die Benutzeroberfläche für das *Minecraft Mods Repository* bereitzustellen.  
Es ermöglicht das **Anzeigen**, **Hochladen** und **statistische Auswerten** von Minecraft-Mods.

---

## 🎯 Projektziel
Dieses Frontend ist Teil des Projekts “Minecraft Mods Repository” (TH Wildau, WS 2025/26).  
Ziel ist eine moderne Benutzeroberfläche, mit der Minecraft-Mods verwaltet und visuell dargestellt werden können.

---

## 💻 Technologien
- **React (Vite + TypeScript)**  
- **TailwindCSS** für modernes, responsives Design  
- **Lucide Icons** für UI-Symbole  
- Struktur in **pages/**, **components/**, **ui/**  

---

## 📂 Projektstruktur

frontend/
├─ src/
│ ├─ components/ → Navbar, Footer, ModCard, UI-Elemente
│ ├─ pages/ → HomePage, ModDetailPage, StatsPage, UploadPage
│ ├─ ui/ → Buttons, Textarea, Inputs
│ ├─ assets/ → Bilder & statische Dateien
│ ├─ main.tsx, App.tsx
│ └─ index.css / App.css
├─ public/
├─ package.json
├─ vite.config.ts
└─ README.md

---

## 🚀 Features
- **HomePage:** Liste aller Mods mit Such- und Sortierfunktion  
- **ModDetailPage:** Detailansicht mit Beschreibung, Versionen, Downloads und Favoriten  
- **UploadPage:** Formular zum Hinzufügen eines neuen Mods  
- **StatsPage:** Beispielhafte Statistiken (Top-Mods, Beliebtheit, Downloads)  
- **Design:** Dunkles, modernes UI mit klarer Struktur  

---

## 🔗 Backend-Integration
Das Frontend ist vorbereitet für die Anbindung an die REST-API:
- `GET /api/mods` – Liste aller Mods  
- `GET /api/stats` – Statistikdaten  
- `POST /api/mods/upload` – Hochladen eines Mods  

Die Verbindung erfolgt, sobald das Backend-Team die Endpunkte bereitstellt.

---

## ⚙️ Installation & Start

```bash
npm install
npm run dev
