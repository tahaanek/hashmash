# HashMash — Hashtag ⇄ Comma Converter with Voice Input

## Overview
HashMash is a single-page web tool that converts between hashtag and comma-separated keyword formats for social media. Includes multilingual voice input (speech-to-text) that transcribes spoken keywords and formats them as both comma-separated and hashtag outputs.

## Architecture
- **Backend**: Laravel 10 (PHP 8.2) with nwidart/laravel-modules
- **Modules**: `Modules/HashMash/` — contains the hash controller, routes, service provider, and config (legacy cryptographic hash API; the converter runs fully client-side)
- **Frontend**: Vue 3 + TailwindCSS v3 served by Vite dev server on port 3000
- **Dev wiring**: Vite proxies `/api` requests to Laravel on port 8000; browser only talks to port 3000

## Frontend Structure
- `resources/js/App.vue` — layout shell: sticky header, dark mode toggle (auto-detect + manual override via localStorage)
- `resources/js/components/ConverterTool.vue` — main converter: mode toggle, input/output, copy, counters, camelCase setting, voice integration
- `resources/js/components/VoiceInput.vue` — mic button, language dropdown, first-time language confirmation, graceful degradation
- `resources/js/components/LanguageModal.vue` — first-time voice language confirmation modal
- `resources/js/components/FaqSection.vue` — SEO FAQ section with crawlable text
- `resources/js/composables/useSpeechRecognition.js` — Web Speech API wrapper (continuous, interim results, auto-restart)
- `resources/js/utils/converter.js` — tokenization and conversion logic (Unicode-safe)
- `resources/js/utils/languages.js` — supported language list and browser detection

## Key Design Decisions
- All conversion is client-side — no server round-trips
- Both output formats (comma + hashtag) are always visible and copyable
- Voice transcript appends to the editable input textarea (not locked)
- Language preference saved to `localStorage` key `hashmash-voice-lang`
- Dark mode saved to `localStorage` key `hashmash-dark-mode`
- Input auto-saved to `localStorage` key `hashmash-input`
- TailwindCSS dark mode uses `class` strategy (not just `prefers-color-scheme`) for manual override

## Docker Setup
- `docker-compose.base44.yml` — dev compose (single `web` service)
- `Dockerfile.base44` — PHP 8.2 + Node 20 + Composer base image
- `docker/start.sh` — scaffolds Laravel on first boot, installs deps, starts both servers

## Verification
- Visit `/` — HashMash converter UI loads
- Type hashtags → comma output appears live (debounced 150ms)
- Toggle mode (, → #) → type comma-separated → hashtag output appears
- Tap mic button → language confirmation modal → speak → transcript fills textarea → both outputs update
- Copy buttons copy to clipboard with ✓ animation
- Dark mode toggle in header works and persists
- `GET /api/algorithms` — returns available hash algorithms (legacy)
- `POST /api/hash` with `{ "text": "hello" }` — returns all hashes (legacy)
