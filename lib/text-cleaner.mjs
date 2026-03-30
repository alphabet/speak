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
 * Extract the first N sentences.
 */
export function truncate(text, sentences = 1) {
  const parts = text.split('. ');
  return parts.slice(0, sentences).join('. ');
}

/**
 * Prepare text for speech: optionally clean, then truncate.
 */
export function prepare(text, { cleanMode = 'terse', sentences = 1 } = {}) {
  const processed = cleanMode === 'terse' ? clean(text) : text;
  return truncate(processed, sentences);
}
