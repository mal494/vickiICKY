# Arcana Sanctuary — Vicky's Tarot Journal & Live Vision Interpreter

Arcana Sanctuary is a digital tarot journal and reading sanctuary built for Vicky to interpret physical card spreads via camera or draw cards digitally, listen to live audio readings from a compassionate spiritual guide, and archive every session in a PostgreSQL database to track long-term spiritual growth.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during the initial interview and govern the application architecture:

- **Confirmed Capture Mode**: Both live camera scanning of physical tarot spreads (using Safari-compatible camera video capture / photo upload) and an interactive digital card drawer.
- **Confirmed Reading Tone**: Mystical, compassionate guide with deep psychological and spiritual insight, grounded in authentic Rider-Waite-Smith (RWS) symbolism.
- **Confirmed Growth Insights**: Longitudinal tracking of recurring card frequencies, suit balances (Wands, Cups, Swords, Pentacles), Major vs. Minor Arcana distributions, and a session archive with audio playback.
- **Data Persistence**: Central source of truth stored in a scalable PostgreSQL database hosted on Cloud SQL with Drizzle ORM, secured by Firebase Authentication.
- **Browser & Audio Target**: Tailored for Safari on iOS and macOS with zero-latency audio unlock (`AudioContext` / HTML5 Audio) and touch-ergonomic viewport design.

---

### 1. Overview & Core Concept

- **What It Does**: Vicky can either photograph her real-world physical tarot spreads using her iPhone or Mac camera, or perform digital pulls (Single Card Daily Insight, 3-Card Past/Present/Future, or 5-Card Cross of Guidance). Gemini vision parses the cards, detects orientations (upright or reversed), and generates an authentic Rider-Waite interpretation. A live audio narration is synthesized in real time via Gemini TTS (`gemini-3.8-flash-lite-tts`) with player controls (play, pause, seek, speed). Every reading is automatically archived with notes, tags, and card metadata into PostgreSQL.
- **Target Audience / Persona**: Vicky, an intuitive tarot reader who wants her spreads systematically cataloged without tedious manual typing, paired with rich audio for contemplative reflection.
- **Key Value**: Bridges the tactile magic of physical tarot decks with modern AI vision and audio, eliminating manual journaling while preserving deep symbolic accuracy and spiritual progression tracking over time.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Daily Card / Reading Initiation**:
   - Vicky enters the sanctuary. She chooses between **Scan Physical Spread** (camera / photo) or **Draw Digital Cards**.
   - She can specify a query, intention, or focus question (e.g., "What energy should I embody today?", "Career path decision", or general open reflection).
2. **Spread Capture & AI Analysis**:
   - *Physical Scan*: Live camera viewfinder with guide overlays and camera flip (back/front lens switch). Vicky snaps a photo or uploads a high-resolution snapshot. Gemini vision identifies the cards, their layout positions, and orientations.
   - *Digital Draw*: Vicky shuffles the deck and taps cards to reveal them with flip animations and golden aura highlights.
3. **Live Interpretation & Audio Playback**:
   - The reading unveils card-by-card with authentic Rider-Waite illustrations, keywords, upright/reversed meanings, and a cohesive synthesis.
   - Vicky can press **Listen to Guidance** to stream the soothing, compassionate voice of the spiritual guide, with waveform visualization and audio scrub controls.
4. **Journal Archival & Personal Reflections**:
   - Vicky adds personal retrospective notes, selects emotional/intuitive tags, and clicks **Save to Journal**.
   - The session saves directly to PostgreSQL with timestamp, spread type, card breakdown, audio status, and notes.
5. **Growth & Analytics Dashboard**:
   - Vicky browses past sessions with date filters, card searches, and audio re-play.
   - An interactive analytics dashboard visualizes:
     - Most frequent cards pulled over time (e.g., "The High Priestess appears in 24% of your readings").
     - Elemental & suit balance (Fire/Wands, Water/Cups, Air/Swords, Earth/Pentacles).
     - Upright vs. Reversed ratio and Major Arcana frequency.

#### Visual Identity & Theme
- **Aesthetic Direction**: *Ethereal Occult & Editorial Sanctuary* — deeply contemplative, mystical yet clean, reminiscent of sacred geometric manuscripts and refined botanical apothecary journals.
- **Color Palette**:
  - *Dominant Canvas (60%)*: Deep Obsidian / Midnight Slate (`#0B0D13` to `#12151F`).
  - *Structural Surfaces (30%)*: Velvet Night Card Layers (`#191D2B`), delicate warm golden hairlines (`rgba(212, 175, 55, 0.15)`), and antique parchment typography (`#EAE5D9`).
  - *Accents (10%)*: Celestial Gilded Gold (`#D4AF37` / `#F3C64F`) and Mystical Amethyst Violet (`#9D72FF`) for interactive focal points, active tabs, and aura glows.
- **Typography & Hierarchy**:
  - Display & Headings: `Cinzel` / `Playfair Display` for esoteric titles and card names.
  - Body Prose: `Plus Jakarta Sans` for clean, high-legibility readings and notes.
  - Metadata & Stats: Tabular numerals with clean typographic separators (`·`).
- **Safari Compatibility & Touch Ergonomics**:
  - Unlocked `AudioContext` on first user tap to guarantee seamless playback without Safari autoplay restrictions.
  - Native `getUserMedia` constraints with fallback file picker for iOS camera permissions.
  - Minimum 44px touch hitboxes and sticky bottom action drawers for one-handed thumb ergonomics.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full 78-Card Rider-Waite-Smith Library with Vector/High-Res Assets**:
  - *Chosen Approach*: Include complete structured metadata (all 22 Major Arcana + 56 Minor Arcana across 4 suits) with astrological correspondences, upright/reversed interpretations, and traditional RWS artwork.
  - *Why*: Vicky values authentic Rider-Waite consistency. Built-in card data guarantees zero hallucinations on card meanings and instant local lookup even before AI synthesis.
- **Decision 2: Multimodal Vision + Live TTS Pipeline**:
  - *Chosen Approach*: Use Gemini 3.8 Flash (`gemini-3.8-flash`) for vision-based spread recognition and symbolic synthesis, paired with Gemini Flash Lite TTS (`gemini-3.8-flash-lite-tts`) with voice `Kore` or `Zephyr` (soothing, compassionate cadence) outputting 24kHz audio.
  - *Why*: Delivers an intimate, spoken-word tarot experience that feels like receiving guidance from a trusted mentor.
- **Decision 3: Cloud SQL (PostgreSQL) + Drizzle ORM Data Architecture**:
  - *Chosen Approach*: Scalable PostgreSQL database provisioned via Cloud SQL with Drizzle ORM for type-safe relational queries and migrations, backed by Firebase Auth for user session security and data isolation.
  - *Why*: Satisfies the explicit requirement for a scalable, cloud-hosted PostgreSQL database as the central source of truth for Vicky's spiritual journal and historical analytics.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Safari Browser Client (React + TS)                    │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐ │
│  │  Camera / Spread View │  │  Digital Card Drawer  │  │ Audio Player Bar │ │
│  │  (WebRTC + Canvas)    │  │  (Shuffle, Flip, Aura)│  │ (Waveform & TTS) │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └────────┬─────────┘ │
│              │                          │                       │           │
│  ┌───────────▼──────────────────────────▼───────────────────────▼─────────┐ │
│  │                Journal & Spiritual Growth Analytics Views              │ │
│  │           (Card Frequencies, Suit Balances, Filterable Archive)        │ │
│  └──────────────────────────────────────┬─────────────────────────────────┘ │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │ HTTP / REST APIs
┌─────────────────────────────────────────▼───────────────────────────────────┐
│                      Express Full-Stack Server (server.ts)                  │
│                                                                             │
│  ┌─────────────────────┐  ┌───────────────────────┐  ┌────────────────────┐ │
│  │  /api/tarot/analyze │  │   /api/tarot/tts      │  │ /api/readings CRUD │ │
│  │  (Gemini Vision API)│  │   (Gemini TTS API)    │  │ (Drizzle + Pool)   │ │
│  └──────────┬──────────┘  └───────────┬───────────┘  └──────────┬─────────┘ │
└─────────────┼─────────────────────────┼─────────────────────────┼───────────┘
              │                         │                         │
┌─────────────▼─────────────────────────▼─────────┐  ┌────────────▼───────────┐
│         Google Gemini 3.8 Flash & TTS           │  │  Cloud SQL PostgreSQL  │
│  (Multimodal Card Detection & Audio Synthesis)  │  │  (Central Source of    │
└─────────────────────────────────────────────────┘  │   Truth Database)      │
                                                     └────────────────────────┘
```

#### PostgreSQL Data Model (`src/db/schema.ts`)
- **`users` Table**:
  - `id` (serial primary key)
  - `uid` (text, unique Firebase Auth UID)
  - `email` (text)
  - `displayName` (text)
  - `createdAt` (timestamp)
- **`readings` Table**:
  - `id` (serial primary key)
  - `userId` (integer foreign key -> `users.id`)
  - `spreadType` (text: `'daily_card'`, `'three_card'`, `'celtic_cross'`, `'custom_spread'`)
  - `query` (text, question/intention)
  - `interpretation` (text, complete AI synthesis)
  - `audioBase64` (text, optional synthesized TTS audio)
  - `photoUrl` (text, optional camera scan snapshot)
  - `notes` (text, Vicky's personal reflections)
  - `tags` (text array / JSON, e.g. `['love', 'career', 'shadow-work']`)
  - `createdAt` (timestamp)
- **`reading_cards` Table**:
  - `id` (serial primary key)
  - `readingId` (integer foreign key -> `readings.id` on delete cascade)
  - `cardId` (text, e.g. `'the_fool'`, `'queen_of_cups'`)
  - `cardName` (text)
  - `suit` (text: `'major'`, `'wands'`, `'cups'`, `'swords'`, `'pentacles'`)
  - `positionName` (text: `'Past'`, `'Present'`, `'Future'`, `'Obstacle'`, etc.)
  - `isReversed` (boolean)
  - `cardSummary` (text, card-specific insight for this position)

#### Component & State Mapping
- `CameraSpreadScanner`: Manages camera permissions, video stream, canvas snapshot capture, frame guidance overlay, and upload fallbacks.
- `DigitalCardDrawer`: Interactive card deck with shuffle animation, deal physics, interactive card selection, and flip reveal.
- `ReadingPresenter`: Displays active spread cards with high-res illustrations, position tags, upright/reversed status, keyword badges, and the synthesized interpretation.
- `LiveAudioNarrator`: Audio streaming controller with play/pause, seek scrubber, playback speed selector (0.8x, 1x, 1.2x), and Safari audio unlock trigger.
- `JournalArchive`: Filterable list and grid of past readings with full-text search, date range picking, card filtering, and inline notes editor.
- `GrowthAnalytics`: Visual charts for recurring cards, suit distributions, Major Arcana ratio, and streak tracking.

---

### 5. Implementation Stages (Upon Approval)

1. **Cloud SQL Eligibility & Provisioning**:
   - Run `CheckFeatureEligibility` and present Cloud SQL setup gate via `show_aistudio_ui`.
   - Provision Cloud SQL PostgreSQL instance and configure Firebase Auth with Google OAuth.
   - Install dependencies (`drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`, `firebase`, `firebase-admin`).
   - Define schema in `src/db/schema.ts`, configure `drizzle.config.ts`, and run schema push.
2. **Server Architecture & Gemini Endpoints**:
   - Implement `server.ts` with Express, connection pooling, and Firebase auth verification.
   - Set up `/api/tarot/analyze-spread` with multimodal Gemini vision for card recognition.
   - Set up `/api/tarot/interpret` for in-depth Rider-Waite symbolic synthesis.
   - Set up `/api/tarot/synthesize-voice` with `gemini-3.8-flash-lite-tts` for live guidance narration.
   - Implement `/api/readings` CRUD endpoints and `/api/analytics` summary aggregations.
3. **Frontend Tarot Sanctuary & Safari Experience**:
   - Build 78-card Rider-Waite dataset with symbolic meanings, suits, and keywords.
   - Generate mystical theme visual assets using `generate_image`.
   - Build Camera Viewfinder with mobile Safari camera switch, digital deck drawer, reading view, audio player, and growth analytics dashboard.
   - Test and verify build with `compile_applet`.
