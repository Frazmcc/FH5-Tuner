// Usage: node scripts/csvToJson.cjs data/fh5_cars.csv data/schema/fh5_cars.json
// Run from repository root
const fs = require('fs');
const path = require('path');

function guessNumber(value) {
  if (value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : value;
}

function parseCSV(content) {
  const rows = [];
  let i = 0;
  let cur = '';
  let row = [];
  let inQuotes = false;

  while (i < content.length) {
    const ch = content[i];

    if (ch === '"') {
      if (inQuotes && content[i+1] === '"') {
        cur += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      i++;
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i+1] === '\n') {
        i++;
      }
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      i++;
      continue;
    }

    cur += ch;
    i++;
  }

  if (cur !== '' || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

function toTypedValue(key, raw) {
  if (raw === '') return null;

  const numericKeys = [
    'year','price','pi','power','power_hp','power_kw','weight','weight_lbs',
    'engine_size','displacement','displacement_l','torque','gears',
    'electricmotors','electric_motors','b60','b100','g60','g120','a60','a100',
    'topspeed','top_speed'
  ];

  const lower = key.toLowerCase();
  for (const token of numericKeys) {
    if (lower.includes(token)) {
      const num = Number(raw);
      return Number.isFinite(num) ? num : raw;
    }
  }

  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);

  return raw;
}

function csvToJson(csvPath, outPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);

  if (rows.length === 0) {
    throw new Error('CSV appears empty');
  }

  const headers = rows[0].map(h => h.trim());
  const objects = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.every(cell => cell === '')) continue;

    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c] || `col_${c}`;
      const raw = (c < row.length) ? row[c] : '';
      const trimmed = raw === '' ? '' : raw.trim();
      obj[key] = toTypedValue(key, trimmed);
    }
    objects.push(obj);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(objects, null, 2), 'utf8');
  console.log(`Converted ${csvPath} → ${outPath} (${objects.length} entries)`);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: node scripts/csvToJson.cjs <in.csv> <out.json>');
    process.exit(2);
  }
  const [inPath, outPath] = argv;
  csvToJson(inPath, outPath);
}