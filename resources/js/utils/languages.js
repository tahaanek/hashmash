/**
 * Supported languages for voice input (Web Speech API / BCP-47 codes).
 * Languages marked `fallback: true` have limited or no native browser support
 * and will show a graceful degradation message.
 */
export const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'lo-LA', name: 'Lao', nativeName: 'ລາວ', fallback: true },
  { code: 'my-MM', name: 'Myanmar (Burmese)', nativeName: 'မြန်မာ', fallback: true },
]

/**
 * Detect the best matching language code from the browser's navigator.language.
 * Falls back to 'en-US' if no match is found.
 * @returns {string} BCP-47 language code
 */
export function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return 'en-US'
  const browserLangs = navigator.languages || [navigator.language || 'en-US']

  for (const bl of browserLangs) {
    if (!bl) continue
    const lower = bl.toLowerCase()
    // Exact match
    const exact = LANGUAGES.find(l => l.code.toLowerCase() === lower)
    if (exact) return exact.code
    // Prefix match (e.g. "en" → "en-US", "th" → "th-TH")
    const prefix = lower.split('-')[0]
    const partial = LANGUAGES.find(l => l.code.toLowerCase().startsWith(prefix + '-'))
    if (partial) return partial.code
  }

  return 'en-US'
}

/**
 * Get the language object by code.
 * @param {string} code - BCP-47 code
 * @returns {{ code: string, name: string, nativeName: string, fallback?: boolean } | undefined}
 */
export function getLanguage(code) {
  return LANGUAGES.find(l => l.code === code)
}
