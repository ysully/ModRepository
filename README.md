# 🧩 Minecraft Mods Repository

Ein vollständiges **Client-Server-System** zum Verwalten, Anzeigen und Hochladen von Minecraft-Mods (Java Edition).  
Das Projekt wurde im Rahmen der Vorlesung *Projekt 2 (P2)* an der **TH Wildau** entwickelt.

---

## 🚀 Funktionsübersicht

### 🗂 Repository-Funktionen
- Anzeige aller gespeicherten **Mods** in einer modernen, responsiven Oberfläche  
- **Suchfunktion** (nach Titel, Beschreibung oder Autor)  
- **Sortierung** nach:
  - Trending  
  - Neueste  
  - Beliebteste (Favoriten)  
  - Downloads  
- **Detailansicht** mit:
  - Beschreibung, Autor, Bild  
  - unterstützten Minecraft-Versionen  
  - Download-Button (mit Zähler)  
  - Favoriten (❤) und Views-Zähler  
- **Upload-Seite**:
  - Mods mit Titel, Autor, Kategorie, Beschreibung & Versionen hochladen  
  - Pflichtfeld: `.jar`-Datei (optional: Bild)
- **Statistik-Seite**:
  - Top 10 meist heruntergeladene Mods  
  - Beliebteste Mods pro Minecraft-Version  
  - Gesamtzahlen (Mods, Downloads, Views, Versionen)

---

## ⚙️ Technischer Aufbau

| Ebene | Technologie | Beschreibung |
|--------|--------------|---------------|
| **Frontend** | React + TypeScript + Vite + TailwindCSS | Single-Page-Application mit Routing, Suche, Sortierung & Upload |
| **Backend** | Java 21 + Spring Boot | REST-API mit SQLite-Persistenz & Dateispeicherung |
| **Datenbank** | SQLite (`data/mods.db`) | Speicherung aller Mod-Metadaten |
| **Storage** | Filesystem (`data/files`, `data/images`) | Ablage der hochgeladenen `.jar`-Dateien und Bilder |

---

## 🧑‍💻 Entwicklungsstart (Dev-Modus)

Dieser Modus eignet sich, wenn du Frontend und Backend **getrennt** starten und live entwickeln möchtest.

### 🔧 Voraussetzungen
- Node.js ≥ 18  
- Java ≥ 17  
- Maven installiert  

---

### 🔹 Schritt 1 – Backend starten
```bash
cd mod-repo-backend
mvn spring-boot:run
```

- Das Backend läuft anschließend auf:  
  👉 [http://localhost:8080](http://localhost:8080)

---

### 🔹 Schritt 2 – Frontend starten
In einem **neuen Terminalfenster**:
```bash
cd frontend
npm install     # nur beim ersten Mal nötig
npm run dev
```

- Das Frontend läuft anschließend auf:  
  👉 [http://localhost:5173](http://localhost:5173)

💡 Das Frontend ist über den **Vite-Proxy** mit dem Backend verbunden (`/api` → `http://localhost:8080`).

---

## 🧾 Hinweise

- Deep Links wie `/mod/2` funktionieren automatisch durch den SPA-Fallback.
- Beim Hochladen werden Dateien automatisch im `data/`-Verzeichnis abgelegt.
- Die SQLite-Datenbank `mods.db` enthält alle Metadaten der Mods.
- Die Anwendung ist vollständig **client-server-basiert** und erfüllt alle **Projektanforderungen**:
  - persistente Datenspeicherung  
  - gleichzeitige Mehrbenutzung  
  - serverseitige REST-API  
  - moderne, intuitive Weboberfläche  

---

## ✅ Zusammenfassung der Projektanforderungen

| Nr. | Anforderung | Erfüllt |
|----:|--------------|:-------:|
| 1 | Softwareanwendung für Minecraft-Mods (Java Edition) | ✅ |
| 2 | Speicherung von Titel, Beschreibung, Bild, Versionen, Beliebtheit, Datum | ✅ |
| 3 | Anzeige aller Mods (Tabelle/Kartenansicht) | ✅ |
| 4 | Download-Funktion für Mod-JARs | ✅ |
| 5 | Statistische Auswertungen (Top, Versionen) | ✅ |
| 6 | Ansprechende, moderne Oberfläche | ✅ |
| 7 | Client-Server-Architektur mit persistenter Speicherung | ✅ |
| 8 | Backend in Java (Spring Boot), Frontend frei gewählt | ✅ |

---

**Autoren:** Sullyvin Klehr, ... 
**Modul:** Programmierung 2 - Telematik – TH Wildau  
**Jahr:** WS 2025/26  
