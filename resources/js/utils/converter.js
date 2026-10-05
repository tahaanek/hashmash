/**
 * Converter utility — tokenizes text into keywords and formats as comma or hashtag.
 * Handles Unicode (Thai, Chinese, Japanese, Korean, etc.) correctly by using
 * regex that respects multi-byte characters.
 */

/**
 * Tokenize input text into an array of clean keyword tokens.
 * Splits on hashtags (#), commas, line breaks, and whitespace.
 * Trims, removes duplicates (case-insensitive dedup, preserves first casing),
 * and removes empty entries. Preserves original casing.
 *
 * @param {string} input - Raw input text
 * @returns {string[]} - Array of unique, trimmed tokens
 */
export function tokenize(input) {
  if (!input || !input.trim()) return []

  // Replace delimiters (#, commas, newlines) with spaces, then split on whitespace.
  // This handles mixed input like "#travel, food\n#bangkok" uniformly.
  const normalized = input
    .replace(/#/g, ' ')
    .replace(/,/g, ' ')
    .replace(/[\r\n]+/g, ' ')

  const tokens = normalized.split(/\s+/).filter(t => t.length > 0)

  // Deduplicate case-insensitively, preserving first occurrence's casing.
  const seen = new Set()
  return tokens.filter(t => {
    const key = t.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Split a camelCase / PascalCase string into separate words.
 * e.g. "TravelInThailand" → "Travel In Thailand"
 * Handles sequences of capitals (e.g. "HTMLParser" → "HTML Parser").
 *
 * @param {string} str - camelCase / PascalCase string
 * @returns {string} - Space-separated words
 */
export function splitCamelCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

/**
 * Convert input to comma-separated format.
 * @param {string} input - Raw input
 * @param {{ splitCamel?: boolean }} opts - If true, splits camelCase tokens into words
 * @returns {string} - Comma-separated keywords
 */
export function toComma(input, { splitCamel = false } = {}) {
  const tokens = tokenize(input)
  const processed = splitCamel ? tokens.map(splitCamelCase) : tokens
  return processed.join(', ')
}

/**
 * Convert input to hashtag-separated format.
 * @param {string} input - Raw input
 * @param {{ splitCamel?: boolean }} opts - If true, splits camelCase tokens into words
 * @returns {string} - Space-separated hashtags (each prefixed with #)
 */
export function toHashtag(input, { splitCamel = false } = {}) {
  const tokens = tokenize(input)
  const processed = splitCamel ? tokens.map(splitCamelCase) : tokens
  return processed.map(t => '#' + t).join(' ')
}

/**
 * Count the number of unique tags in the input.
 * @param {string} input - Raw input
 * @returns {number}
 */
export function countTags(input) {
  return tokenize(input).length
}
