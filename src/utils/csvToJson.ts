// src/utils/csvToJson.ts
// Convert parsed CSV rows (CsvRow[]) into typed FH5Car[] objects.
// This avoids unsafe TypeScript casts and resolves the "conversion may be a mistake" error.

export type CsvRow = Record<string, any>;

export type FH5Car = {
  manufacturer: string;
  model: string;
  year?: number | null;
  pi?: number | null;
  power_hp?: number | null;
  weight_lbs?: number | null;
  drivetrain?: string | null;
  engine_type?: string | null;
  aspiration?: string | null;
  displacement_l?: number | null;
  // keep additional properties available
  _raw?: CsvRow;
};

function normStr(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}
function toNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[, ]+/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function csvRowToFH5Car(row: CsvRow): FH5Car {
  return {
    manufacturer: normStr(row['Manufacturer'] ?? row['manufacturer'] ?? row['Make'] ?? ''),
    model: normStr(row['Model'] ?? row['model'] ?? row['Car'] ?? ''),
    year: toNum(row['Year'] ?? row['year']),
    pi: toNum(row['PI'] ?? row['Pi'] ?? row['pi']),
    power_hp: toNum(row['Power'] ?? row['power'] ?? row['power_hp']),
    weight_lbs: toNum(row['Weight'] ?? row['weight'] ?? row['weight_lbs'] ?? row['Weight_lbs']),
    drivetrain: normStr(row['Drivetrain'] ?? row['drivetrain'] ?? ''),
    engine_type: normStr(row['Engine_Type'] ?? row['Engine Type'] ?? row['engine_type'] ?? row['EngineType'] ?? ''),
    aspiration: normStr(row['Aspiration'] ?? row['aspiration'] ?? ''),
    displacement_l: toNum(row['Displacement_L'] ?? row['Displacement'] ?? row['displacement_l'] ?? row['displacement']),
    _raw: row,
  };
}

export function convertCsvRows(rows: CsvRow[]): FH5Car[] {
  return rows.map(csvRowToFH5Car);
}
