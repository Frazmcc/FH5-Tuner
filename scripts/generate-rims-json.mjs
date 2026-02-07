import fs from 'node:fs';
import path from 'node:path';

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Handle escaped quotes "" inside quoted fields
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out.map((v) => v.trim());
}

function toNumber(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function main() {
  const repoRoot = process.cwd();
  const csvPath = path.join(repoRoot, 'data', 'FH5 Rim List - Dem Rims Boiiiiii.csv');
  const outPath = path.join(repoRoot, 'data', 'fh5_rims.json');

  const csvText = fs.readFileSync(csvPath, 'utf8');
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error(`CSV appears empty: ${csvPath}`);
  }

  const headers = parseCsvLine(lines[0]);
  const idx = (name) => headers.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());

  const styleI = idx('Style');
  const manufacturerI = idx('Manufacturer');
  const nameI = idx('Name');
  const sizeI = idx('Size');
  const priceI = idx('Price');
  const weightI = idx('Weight');

  const missing = [];
  if (styleI < 0) missing.push('Style');
  if (manufacturerI < 0) missing.push('Manufacturer');
  if (nameI < 0) missing.push('Name');
  if (sizeI < 0) missing.push('Size');
  if (priceI < 0) missing.push('Price');

  if (missing.length) {
    throw new Error(`Missing required columns in rim CSV: ${missing.join(', ')}`);
  }

  const rims = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);

    const style = (values[styleI] ?? '').trim();
    const manufacturer = (values[manufacturerI] ?? '').trim();
    const rimName = (values[nameI] ?? '').trim();
    const size = toNumber(values[sizeI]);
    const price = toNumber(values[priceI]);
    const weight = weightI >= 0 ? toNumber(values[weightI]) : undefined;

    if (!style || !manufacturer || !rimName) continue;
    if (size === undefined || price === undefined) continue;

    const entry = {
      style,
      manufacturer,
      name: rimName,
      size,
      price,
      ...(weight !== undefined ? { weight } : {}),
    };

    rims.push(entry);
  }

  rims.sort((a, b) => {
    const as = a.style.localeCompare(b.style);
    if (as !== 0) return as;
    const am = a.manufacturer.localeCompare(b.manufacturer);
    if (am !== 0) return am;
    const an = a.name.localeCompare(b.name);
    if (an !== 0) return an;
    return (a.size ?? 0) - (b.size ?? 0);
  });

  fs.writeFileSync(outPath, JSON.stringify(rims, null, 2) + '\n', 'utf8');

  const styles = Array.from(new Set(rims.map((r) => r.style))).sort();
  console.log(`Wrote ${rims.length} rims to ${path.relative(repoRoot, outPath)}`);
  console.log(`Styles in CSV: ${styles.join(', ')}`);
  if (weightI < 0) {
    console.log('Note: No Weight column found in CSV; output omits weight.');
  }
}

main();
