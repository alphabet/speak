/**
 * Strip markdown formatting from text for clean speech output.
 * Ported from hooks.py lines 462-471.
 */
export function clean(text) {
  let s = text;
  s = s.replace(/```[\s\S]*?```/g, '');           // code fences
  s = s.replace(/`[^`]*`/g, '');                   // inline code
  s = s.replace(/#{1,6}\s*/g, '');                 // headings
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');  // bold/italic
  s = s.replace(/https?:\/\/\S+/g, '');            // URLs
  s = s.replace(/^\s*[-*>]+\s*/gm, '');            // bullets/quotes
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');   // markdown links
  s = s.replace(/[|_~]/g, ' ');                    // tables, strikethrough
  s = s.replace(/\s+/g, ' ').trim();               // collapse whitespace
  return s;
}

/**
 * Split text into sentences. Handles common abbreviations to avoid false splits.
 */
export function splitSentences(text) {
  if (!text) return [];
  // Protect common abbreviations from being treated as sentence endings.
  const abbrevs = ['e.g.', 'i.e.', 'Dr.', 'Mr.', 'Mrs.', 'Ms.', 'vs.', 'etc.', 'approx.', 'dept.', 'est.', 'vol.'];
  let s = text;
  const placeholders = [];
  for (const abbr of abbrevs) {
    const ph = `__ABBR${placeholders.length}__`;
    placeholders.push({ ph, abbr });
    s = s.replaceAll(abbr, ph);
  }

  // Split on sentence-ending punctuation followed by whitespace or end of string.
  const parts = s.split(/(?<=[.!?])\s+/);

  // Restore abbreviations and filter empties.
  return parts
    .map(p => {
      let r = p;
      for (const { ph, abbr } of placeholders) r = r.replaceAll(ph, abbr);
      return r.trim();
    })
    .filter(Boolean);
}

/**
 * Extract the first N sentences.
 */
export function truncate(text, sentences = 1) {
  const parts = splitSentences(text);
  return parts.slice(0, sentences).join(' ');
}

/**
 * Prepare text for speech: optionally clean, then truncate.
 */
export function prepare(text, { cleanMode = 'terse', sentences = 1 } = {}) {
  const processed = cleanMode === 'terse' ? clean(text) : text;
  return truncate(processed, sentences);
}
