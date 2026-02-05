// (only the small relevant parts shown; insert into your existing file)

function uniqueSortedPreserveCase(items: string[]) {
  // Deduplicate case-insensitively, keep first-seen original casing, then sort by case-insensitive key
  const map = new Map<string, string>();
  for (const it of items) {
    if (!it) continue;
    const key = it.trim();
    const lower = key.toLowerCase();
    if (!map.has(lower)) map.set(lower, key);
  }
  return Array.from(map.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

/* ... later replace calls to uniqueSorted(...) ... */

const manufacturers = useMemo(() => {
  const names = cars.map(c => c.manufacturer);
  return uniqueSortedPreserveCase(names);
}, [cars]);

const modelsForManufacturer = useMemo(() => {
  if (!manufacturer) return [] as string[];
  const filtered = cars
    .filter(c => {
      // match manufacturer exact (both normalized by loader)
      return c.manufacturer === manufacturer;
    })
    .map(c => c.model);
  return uniqueSortedPreserveCase(filtered);
}, [cars, manufacturer]);