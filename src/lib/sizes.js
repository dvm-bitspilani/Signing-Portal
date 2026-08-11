const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * Garment sizes come back from the API in whatever order they were created,
 * which puts XL before S often enough to be confusing. Anything unrecognised
 * (one-size items, oddities) sorts to the end rather than to the front.
 */
export function sortSizes(sizes, key = (s) => s) {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(key(a));
    const ib = SIZE_ORDER.indexOf(key(b));
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });
}
