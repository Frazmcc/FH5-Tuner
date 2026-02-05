// Loads data/schema/fh5_cars.json and provides a normalized array for UI usage.
// Assumes the JSON keys are the CSV headers (e.g. "Manufacturer", "Model", "Year", "PI", "Power", "Weight", ...)
// This file normalizes manufacturer/model strings (trim, collapse whitespace) and exposes a small Car type.

import rawCars from '../../data/schema/fh5_cars.json';

export type RawCar = Record<string, any>;

export type Car = {
  // keep Manufacturer/Model as in CSV but provide canonical lowercase keys too
  Manufacturer: string;
  Model: string;
  Year?: number | null;
  PI?: number | null;
  Power?: number | null;
  Weight?: number | null;
  // original raw object included for full access
  _raw?: RawCar;
};

function normalizeString(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Trim and collapse whitespace
  return s.trim().replace(/\s+/g, ' ');
}

function toNumberMaybe(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[, ]+/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function loadCars(): Car[] {
  const arr: RawCar[] = (rawCars as any) || [];
  return arr.map((r): Car => {
    const manufacturer = normalizeString(r['Manufacturer'] ?? r['manufacturer'] ?? r['Make'] ?? '');
    const model = normalizeString(r['Model'] ?? r['model'] ?? r['Car'] ?? '');
    // Try common numeric headers
    const year = toNumberMaybe(r['Year'] ?? r['year'] ?? r['YEAR']);
    const pi = toNumberMaybe(r['PI'] ?? r['Pi'] ?? r['pi']);
    const power = toNumberMaybe(r['Power'] ?? r['power'] ?? r['power_hp']);
    const weight = toNumberMaybe(r['Weight'] ?? r['weight'] ?? r['Weight_lbs'] ?? r['weight_lbs']);

    return {
      Manufacturer: manufacturer,
      Model: model,
      Year: year,
      PI: pi,
      Power: power,
      Weight: weight,
      _raw: r,
    };
  });
}
