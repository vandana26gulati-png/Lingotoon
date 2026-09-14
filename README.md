# Lingotoon — Animation Production Studio & Pipeline

> Internal video production studio suite for AI animation generation, storyboarding, character model sheet locking, multi-model prompt compilation, generation queues, and cross-platform performance tracking.

![Lingotoon Studio](https://img.shields.io/badge/Lingotoon-Internal%20Studio-7C3AED?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite)

---

## 🌟 Overview

**Lingotoon** organizes every episode into its own dedicated project repository folder. From concept ideation to viral distribution, every step of the pipeline lives in one integrated workspace:

- **Episode Hub (`All Videos`)**: Visual dashboard of all episodes in production, showing real-time storyboard version counts, active shot totals, creators, and live distribution statuses.
- **Live Storyboard Editor**:
  - Direct shot blocking with camera angles (Wide, Close-up, Tracking, Dutch angle, Drone), characters, timing, and frame reference attachments.
  - Review and revision feedback loops: Approve or flag shots for revision with structured rejection reasons that automatically feed into AI prompt regeneration.
  - Quick shot reordering (Move Up / Down), duplication, and deletion.
- **Storyboard Version Control**:
  - Save immutable snapshots of storyboards as versions (v1, v2, v3).
  - Inspect historical shot breakdowns and restore any archived version directly back to the active live storyboard editor.
- **Character Reference Sheets**:
  - Model sheets with visual lock toggle (`Locked Reference` vs `Draft Concept`).
  - Locked characters automatically carry reference strings and visual traits into generated video prompts.
- **Multi-Model AI Prompt Compiler**:
  - Dynamic prompt synthesis merging approved shots, camera framing, and locked character sheets.
  - Direct targeting for **Runway Gen-4**, **Kling 2.0**, **Veo 3**, **Sora 2**, and **Midjourney v6**.
  - One-click prompt copying and dispatch to the rendering queue.
- **Generation Queue & Timeline**:
  - Active rendering queue tracking job statuses (`generating`, `complete`, `failed`, `pending`), destination drive storage paths, and credit expenditures.
  - Interactive simulation to test rendering completions and retries.
  - Chronological project timeline logging all major creative milestones.
- **Platform Analytics & Audience Reviews**:
  - Track uploads across **YouTube Shorts**, **TikTok**, **Instagram Reels**, and internal screenings.
  - Star ratings, comment counts, retention observations, and direct links.
- **Episode Asset Library**:
  - Filterable repository for moodboards, color palettes, prop concepts, and character art.
- **Studio-Wide Credits & Tools Dashboard**:
  - Real-time aggregate spend analysis across all video projects.
  - Breakdown of credit consumption per AI synthesis engine.
  - Average cost calculation per approved video clip.
  - Local persistence via `localStorage` with JSON export & reset capabilities.

---

## 🚀 Quick Start

### 1. Installation

Ensure Node.js is installed. In the project directory:

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Architecture & Tech Stack

- **Framework**: React 18
- **Bundler**: Vite 6
- **Icons**: Lucide React
- **Typography**: Fraunces (Headings) & Inter (UI)
- **Styling**: Modern CSS design system with custom properties, glassmorphism, responsive grid layouts, and accessible modal overlays.
- **State Management**: React Context (`VideoContext`) with automatic `localStorage` synchronization and JSON export/import.

---

## 🎨 Theme Tokens

- **Background & Canvas**: Deep Ink (`#120C1B`), Dark Panel (`#1A1327`, `#241B36`)
- **Accents**: Grape (`#7C3AED`), Iris (`#9B87D9`), Lilac (`#D8CCFB`)
- **Status Codes**: Approved / Good (`#5EC26A`), Needs Changes / Rejected (`#E8697A`), Pending / Warning (`#E3B341`)

---

## 📄 License

Internal Studio Tool — Proprietary to Lingotoon Production Team.
