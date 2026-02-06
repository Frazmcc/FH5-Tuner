// src/utils/loadCars.ts
import rawCars from '../../data/schema/fh5_cars.json';
import type { Car } from '../tuner/engine';

export type { Car };

function normStr(v: any) {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}
function toNum(v: any) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(/[, ]+/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDrivetrain(raw: string): Car['drivetrain'] | null {
  const s = normStr(raw).toLowerCase();
  if (!s) return null;
  if (s.includes('rear')) return 'RWD';
  if (s.includes('front')) return 'FWD';
  if (s.includes('all')) return 'AWD';
  if (s.includes('4')) return '4WD';
  return null;
}

export function loadCars(): Car[] {
  const arr: any[] = (rawCars as any) || [];
  const out: Car[] = [];

  for (const r of arr) {
    const manufacturer = normStr(r['Manufacturer'] ?? r['manufacturer'] ?? r['Make'] ?? '');
    const model = normStr(r['Model'] ?? r['model'] ?? r['Car'] ?? '');

    const year = toNum(r['Year'] ?? r['year'] ?? r['YEAR']);
    const pi = toNum(r['PI'] ?? r['Pi'] ?? r['pi']);
    const power_hp = toNum(r['Power'] ?? r['power'] ?? r['power_hp']);
    const weight_lbs = toNum(r['Weight'] ?? r['weight'] ?? r['weight_lbs'] ?? r['Weight_lbs']);

    const drivetrain = toDrivetrain(r['Drivetrain'] ?? r['drivetrain'] ?? '') ?? 'RWD';

    // Skip entries that can't produce a meaningful tune.
    if (!manufacturer || !model || year === null || pi === null || power_hp === null || weight_lbs === null) continue;

    const engine_type = normStr(r['EngineType'] ?? r['engine_type'] ?? '') || 'Unknown';
    const aspiration = normStr(r['Aspiration'] ?? r['aspiration'] ?? '') || 'Unknown';
    const displacement_l = toNum(r['EngineSize'] ?? r['Engine_Displacement'] ?? r['displacement_l']) ?? 0;

    const gears = toNum(r['Gears']) ?? undefined;
    const weight_distribution_front = toNum(r['WeightDistribution']) ?? undefined;
    const top_speed_mph = toNum(r['TopSpeed']) ?? undefined;
    const torque_ftlb = toNum(r['Torque']) ?? undefined;

    out.push({
      manufacturer,
      model,
      year,
      pi,
      drivetrain,
      power_hp,
      weight_lbs,
      engine_type,
      aspiration,
      displacement_l,
      gears: typeof gears === 'number' ? gears : undefined,
      weight_distribution_front: typeof weight_distribution_front === 'number' ? weight_distribution_front : undefined,
      top_speed_mph: typeof top_speed_mph === 'number' ? top_speed_mph : undefined,
      torque_ftlb: typeof torque_ftlb === 'number' ? torque_ftlb : undefined,
      _raw: r,
    });
  }

  return out;
}
