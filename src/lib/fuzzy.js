/**
 * Small fuzzy search for the browse grid. Lists here are tens of items, so
 * this favours predictable ranking over cleverness:
 *
 *   - every query word has to land somewhere (title or description);
 *   - any title hit outranks any description hit, so "dog" puts DogWatch
 *     above a card that merely mentions dogs;
 *   - within a field, exact word > word prefix > substring > typo > loose
 *     letters-in-order (titles only; long descriptions match anything).
 */

export const normalize = (value) =>
  (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toField = (value) => {
  const text = normalize(value);
  return { text, words: text ? text.split(" ") : [] };
};

/** Levenshtein distance, bailing out once it exceeds `max`. */
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, row[j]);
    }
    if (rowMin > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** Letters of `query` appear in order in `text`; rewards contiguous runs. */
function subsequenceScore(query, text) {
  const compact = text.replace(/ /g, "");
  let qi = 0;
  let runs = 0;
  let lastHit = -2;
  for (let ti = 0; ti < compact.length && qi < query.length; ti++) {
    if (compact[ti] === query[qi]) {
      if (ti !== lastHit + 1) runs++;
      lastHit = ti;
      qi++;
    }
  }
  if (qi < query.length) return 0;
  // One run is a substring (already scored higher); more runs, looser match.
  return 0.25 + 0.2 / runs;
}

function termScore(term, field, { loose }) {
  if (!field.text) return 0;

  let best = 0;
  field.words.forEach((word, i) => {
    if (word === term) best = Math.max(best, i === 0 ? 1 : 0.95);
    else if (word.startsWith(term)) best = Math.max(best, i === 0 ? 0.9 : 0.85);
  });
  if (best) return best;

  if (field.text.includes(term)) return 0.7;

  // Short words typo-match too much prose, so descriptions want a longer term.
  if (term.length >= (loose ? 4 : 5)) {
    const max = term.length >= 7 ? 2 : 1;
    for (const word of field.words) {
      // Compare against the word's same-length prefix too, so a typo in a
      // half-typed word ("scavneg") still finds "scavenger".
      const d = Math.min(
        editDistance(term, word, max),
        editDistance(term, word.slice(0, term.length), max),
      );
      if (d <= max) best = Math.max(best, 0.6 - 0.1 * d);
    }
    if (best) return best;
  }

  if (loose && term.length >= 3) return subsequenceScore(term, field.text);

  return 0;
}

/**
 * Builds a ranker over `items`. `getTitle` / `getDescription` pull the two
 * searchable fields. Returns (query) => items ranked best first; an empty
 * query returns the items untouched.
 */
export function createSearch(items, { getTitle, getDescription }) {
  const index = items.map((item) => ({
    item,
    title: toField(getTitle(item)),
    description: toField(getDescription(item)),
  }));

  return (query) => {
    const phrase = normalize(query);
    if (!phrase) return items;
    const terms = phrase.split(" ");

    const ranked = [];
    index.forEach((entry, order) => {
      let score = 0;
      for (const term of terms) {
        const inTitle = termScore(term, entry.title, { loose: true });
        const inDescription = termScore(term, entry.description, {
          loose: false,
        });
        if (!inTitle && !inDescription) return;
        // Title hits live in (1, 2], description hits in (0, 1].
        score += inTitle ? 1 + inTitle : inDescription;
      }
      if (terms.length > 1) {
        if (entry.title.text.includes(phrase)) score += 1;
        else if (entry.description.text.includes(phrase)) score += 0.5;
      }
      ranked.push({ item: entry.item, score, order });
    });

    return ranked
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .map((r) => r.item);
  };
}
