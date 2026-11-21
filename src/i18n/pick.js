/** Picks the current language from a { en, ta, te } object, falling back to English. Plain strings pass through. */
export function pick(value, lang) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return value;
  return value[lang] ?? value.en;
}

/** Hook-free helper for section dictionaries: const s = dict(STRINGS, lang) where STRINGS = { en: {...}, ta: {...}, te: {...} }. */
export function dict(table, lang) {
  return { ...table.en, ...(table[lang] || {}) };
}
