# Minecraft Mods Repository 🧩

Dieses Repository enthält das Projekt für die Vorlesung **Programmierung 2 (P2)** an der **TH Wildau**. Ziel war die Entwicklung eines funktionsfähigen Client-Server-Systems zur Verwaltung und Bereitstellung von Minecraft-Mods (Java Edition).

## Funktionsübersicht

###  Repository-Funktionen
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

## Technischer Aufbau
Das Projekt ist in eine Frontend- und eine Backend-Komponente unterteilt:

| Komponente | Stack |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Backend** | Java 21, Spring Boot |
| **Datenbank** | SQLite (`data/mods.db`) |
| **Storage** | Lokales Dateisystem für JARs und Bilder |

---

## Installation & Entwicklung

Um das Projekt lokal zu bearbeiten oder zu testen, sollten Frontend und Backend separat gestartet werden.

### Voraussetzungen
* Java 17 oder höher
* Node.js (v18+)
* Maven

### 1. Backend starten
```bash
cd mod-repo-backend
mvn spring-boot:run

```

Das Backend ist anschließend unter `http://localhost:8080` erreichbar.

### 2. Frontend starten

Öffne ein zweites Terminal:

```bash
cd frontend
npm install
npm run dev

```

Das Frontend läuft auf `http://localhost:5173`. Dank der Proxy-Konfiguration in Vite werden API-Anfragen automatisch an den Java-Server weitergeleitet.

---

## Erfüllung der Projektanforderungen

Im Rahmen der P2-Prüfung wurden folgende Anforderungen umgesetzt:

* [x] **Persistente Datenspeicherung:** Nutzung von SQLite und Dateisystem.
* [x] **Client-Server-Architektur:** Saubere Trennung über eine REST-API.
* [x] **Nebenläufigkeit:** Spring Boot handelt parallele Client-Anfragen.
* [x] **Funktionsumfang:** Uploads, Downloads, statistische Auswertungen und Validierung der Pflichtfelder.

---

**Autoren:** Sullyvin Klehr, ...

**Studiengang:** Telematik – TH Wildau

**Semester:** WS 2025/26

