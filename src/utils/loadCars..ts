// src/utils/loadCars.ts
import rawCars from '../../data/schema/fh5_cars.json';

export type Car = {
  manufacturer: string;
  model: string;
  year?: number | null;
  pi?: number | null;
  power_hp?: number | null;
  weight_lbs?: number | null;
  drivetrain?: string | null;
  _raw?: Record<string, any>;
};

function normStr(v: any) {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}
function toNum(v: any) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[, ]+/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function loadCars(): Car[] {
  const arr: any[] = (rawCars as any) || [];
  return arr.map(r => ({
    manufacturer: normStr(r['Manufacturer'] ?? r['manufacturer'] ?? r['Make'] ?? ''),
    model: normStr(r['Model'] ?? r['model'] ?? r['Car'] ?? ''),
    year: toNum(r['Year'] ?? r['year'] ?? r['YEAR']),
    pi: toNum(r['PI'] ?? r['Pi'] ?? r['pi']),
    power_hp: toNum(r['Power'] ?? r['power'] ?? r['power_hp']),
    weight_lbs: toNum(r['Weight'] ?? r['weight'] ?? r['weight_lbs'] ?? r['Weight_lbs']),
    drivetrain: normStr(r['Drivetrain'] ?? r['drivetrain'] ?? ''),
    _raw: r
  }));
}
