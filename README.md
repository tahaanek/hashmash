# HashMash — Hashtag ⇄ Comma Converter with Multilingual Voice Input

A lightweight, mobile-first web tool that converts between hashtag and comma-separated formats for social media keywords. Includes real-time voice input (speech-to-text) supporting English, Thai, and many other languages.

## Features

- **Two conversion modes**: Hashtag → Comma (`#travel #food` → `travel, food`) and Comma → Hashtag (`travel, food` → `#travel #food`)
- **Live conversion**: Output updates as you type (debounced ~150ms)
- **Smart parsing**: Splits on `#`, commas, line breaks, and whitespace; removes duplicates; preserves casing
- **Unicode-safe**: Correctly handles Thai, Chinese, Japanese, Korean, Vietnamese, and other multi-byte scripts
- **camelCase splitting** (optional toggle): `#TravelInThailand` → `Travel In Thailand`
- **Voice input**: Speak keywords in any supported language; transcribed speech auto-formats into both comma and hashtag outputs
- **Language preference**: Saved to localStorage; auto-detected from browser on first visit
- **One-click copy** with success animation
- **Live counters**: Tag count and character count
- **Auto-save**: Input persists across page refreshes
- **Dark mode**: Auto-detects `prefers-color-scheme` with manual override
- **SEO optimized**: Semantic HTML, JSON-LD structured data, Open Graph, Twitter Card, FAQ schema
- **PWA**: Installable via manifest.json

## Tech Stack

- **Frontend**: Vue 3 + TailwindCSS v3 (vanilla JS, no heavy dependencies)
- **Backend**: Laravel 10 (PHP 8.2) — serves the API; all conversion is client-side
- **Build**: Vite dev server on port 3000, proxies `/api` to Laravel on port 8000

## Running Locally

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Visit `http://localhost:3000`.

## Voice Input — Browser Support

| Browser/OS | Support | Notes |
|---|---|---|
| Android Chrome | ✅ Full | Primary path — Web Speech API works natively |
| Desktop Chrome/Edge | ✅ Full | Primary path |
| macOS Safari 14.1+ | ✅ Limited | Works via on-device dictation |
| iOS Safari 14.1+ | ⚠️ Limited | Use keyboard dictation button as fallback |
| Firefox | ❌ Not supported | Shows "type manually" message; converter still works fully |

### Language Support

Fully supported: English (US/UK), Thai, Chinese (Simplified/Traditional), Japanese, Korean, German, French, Spanish (Spain/Mexico), Portuguese (Portugal/Brazil), Vietnamese.

Limited support (graceful fallback to manual typing): Lao, Myanmar/Burmese.

## Known Limitations

- Voice input relies on the browser's native Web Speech API; no cloud STT is used
- Lao (`lo-LA`) and Myanmar (`my-MM`) are not natively supported by most browsers
- iOS Safari has stricter Web Speech API limitations — keyboard dictation is the recommended fallback
- Firefox does not support the Web Speech API — manual typing is always available
