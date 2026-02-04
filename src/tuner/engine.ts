/**
 * FH5 Tuning Engine
 * Hybrid rule-based algorithm that generates complete tune settings
 * based on car specifications, selected upgrades, tune type, and weather
 */

export interface Car {
  manufacturer: string;
  model: string;
  year: number;
  pi: number;
  drivetrain: 'RWD' | 'FWD' | 'AWD' | '4WD';
  power_hp: number;
  weight_lbs: number;
  engine_type: string;
  aspiration: string;
  displacement_l: number;
}

export interface UpgradeSelection {
  [section: string]: {
    [part: string]: string | number;
  };
}

export type TuneType = 'Road' | 'Race' | 'Drift' | 'Offroad' | 'Rally' | 'Cruise' | 'Drag' | 'Street';
export type WeatherPreset = 'Dry' | 'Wet';

export interface TuneOutput {
  // Gearing
  final_drive: number;
  gear_ratios: number[];
  
  // Differential
  differential_accel: number;
  differential_decel: number;
  differential_preload?: number;
  center_diff?: number; // AWD only
  front_diff?: number;  // AWD only
  rear_diff?: number;   // AWD only
  
  // Brakes
  brake_bias: number;
  brake_pressure: number;
  
  // Springs & Anti-Roll Bars
  spring_front: number;
  spring_rear: number;
  arb_front: number;
  arb_rear: number;
  ride_height_front: number;
  ride_height_rear: number;
  
  // Alignment
  camber_front: number;
  camber_rear: number;
  toe_front: number;
  toe_rear: number;
  caster: number;
  
  // Damping
  damping_rebound_front: number;
  damping_rebound_rear: number;
  damping_compression_front: number;
  damping_compression_rear: number;
  
  // Tires
  tire_compound: string;
  tire_pressure_front: number;
  tire_pressure_rear: number;
  
  // Aero
  downforce_front: number;
  downforce_rear: number;
  
  // Power & Electronics
  turbo_map: number;
  traction_control_level: number;
  abs_level: number;
  stability_control: number;
}

/**
 * Calculate power-to-weight ratio in hp/lb
 */
function powerToWeightRatio(car: Car): number {
  return car.power_hp / car.weight_lbs;
}

/**
 * Calculate gearing based on power/weight and tune type
 */
function calculateGearing(car: Car, tuneType: TuneType): { final_drive: number; gear_ratios: number[] } {
  const pwr = powerToWeightRatio(car);
  
  let final_drive = 3.2;
  let gear_base = [2.8, 1.9, 1.4, 1.1, 0.9, 0.75];
  
  switch (tuneType) {
    case 'Drag':
      // Shorter gearing for acceleration
      final_drive = 4.5 + (pwr > 0.2 ? 0.3 : 0);
      gear_base = [3.8, 2.6, 1.85, 1.4, 1.15, 0.95];
      break;
    case 'Race':
      // Balanced for track
      final_drive = 3.5 + (pwr > 0.25 ? 0.2 : -0.2);
      gear_base = [3.0, 2.1, 1.5, 1.2, 1.0, 0.85];
      break;
    case 'Drift':
      // Short gears for power delivery
      final_drive = 4.2;
      gear_base = [3.5, 2.4, 1.7, 1.3, 1.05, 0.9];
      break;
    case 'Offroad':
    case 'Rally':
      // Lower gears for traction
      final_drive = 3.8;
      gear_base = [3.2, 2.2, 1.6, 1.25, 1.0, 0.82];
      break;
    case 'Street':
    case 'Road':
      // Longer for cruising
      final_drive = 3.2 - (pwr > 0.2 ? 0.2 : 0);
      gear_base = [2.8, 1.9, 1.4, 1.1, 0.9, 0.75];
      break;
    case 'Cruise':
      // Very long for highway
      final_drive = 3.0;
      gear_base = [2.6, 1.8, 1.3, 1.05, 0.88, 0.72];
      break;
  }
  
  return { final_drive, gear_ratios: gear_base };
}

/**
 * Calculate differential settings based on drivetrain and tune type
 */
function calculateDifferential(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  const result: Partial<TuneOutput> = {};
  
  // Base values by tune type
  let accel = 50;
  let decel = 20;
  
  switch (tuneType) {
    case 'Race':
      accel = 75;
      decel = 15;
      break;
    case 'Drift':
      accel = 15;
      decel = 5;
      break;
    case 'Drag':
      accel = 100;
      decel = 10;
      break;
    case 'Offroad':
    case 'Rally':
      accel = 60;
      decel = 25;
      break;
    case 'Street':
    case 'Road':
      accel = 50;
      decel = 20;
      break;
    case 'Cruise':
      accel = 45;
      decel = 25;
      break;
  }
  
  result.differential_accel = accel;
  result.differential_decel = decel;
  result.differential_preload = Math.round((accel + decel) / 2.5);
  
  // AWD-specific settings
  if (car.drivetrain === 'AWD' || car.drivetrain === '4WD') {
    result.center_diff = tuneType === 'Drift' ? 70 : 50;  // Rear-biased for drift
    result.front_diff = accel * 0.8;
    result.rear_diff = accel * 0.9;
  }
  
  return result;
}

/**
 * Calculate suspension (springs, ARBs, ride height) based on weight and tune type
 */
function calculateSuspension(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  const weight_factor = car.weight_lbs / 3500; // Normalized to average sports car
  
  let spring_base = 450;
  let arb_base = 25;
  let ride_height_base = 10;
  
  switch (tuneType) {
    case 'Race':
      spring_base = 600;
      arb_base = 30;
      ride_height_base = 6;
      break;
    case 'Drift':
      spring_base = 500;
      arb_base = 20;
      ride_height_base = 12;
      break;
    case 'Drag':
      spring_base = 550;
      arb_base = 15;
      ride_height_base = 5;
      break;
    case 'Offroad':
      spring_base = 350;
      arb_base = 18;
      ride_height_base = 18;
      break;
    case 'Rally':
      spring_base = 380;
      arb_base = 20;
      ride_height_base = 15;
      break;
    case 'Street':
    case 'Road':
      spring_base = 450;
      arb_base = 25;
      ride_height_base = 10;
      break;
    case 'Cruise':
      spring_base = 400;
      arb_base = 22;
      ride_height_base = 12;
      break;
  }
  
  // Adjust for weight
  const spring_front = Math.round(spring_base * weight_factor);
  const spring_rear = Math.round(spring_base * weight_factor * 0.92);
  const arb_front = Math.round(arb_base * weight_factor);
  const arb_rear = Math.round(arb_base * weight_factor * 0.9);
  
  // Drag setup - weight transfer
  const ride_height_front = tuneType === 'Drag' ? ride_height_base : ride_height_base;
  const ride_height_rear = tuneType === 'Drag' ? ride_height_base + 3 : ride_height_base + 1;
  
  return {
    spring_front,
    spring_rear,
    arb_front,
    arb_rear,
    ride_height_front,
    ride_height_rear
  };
}

/**
 * Calculate alignment (camber, toe, caster) based on tune type and drivetrain
 */
function calculateAlignment(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  let camber_front = -1.5;
  let camber_rear = -1.2;
  let toe_front = 0.0;
  let toe_rear = 0.1;
  let caster = 5.5;
  
  switch (tuneType) {
    case 'Race':
      camber_front = -2.5;
      camber_rear = -2.0;
      toe_front = -0.1;
      toe_rear = 0.2;
      caster = 6.5;
      break;
    case 'Drift':
      camber_front = -3.0;
      camber_rear = -2.5;
      toe_front = 0.0;
      toe_rear = 0.3;
      caster = 7.0;
      break;
    case 'Drag':
      camber_front = -2.0;
      camber_rear = -1.5;
      toe_front = 0.0;
      toe_rear = 0.0;
      caster = 5.0;
      break;
    case 'Offroad':
      camber_front = -1.0;
      camber_rear = -0.8;
      toe_front = 0.0;
      toe_rear = 0.1;
      caster = 5.0;
      break;
    case 'Rally':
      camber_front = -1.5;
      camber_rear = -1.2;
      toe_front = 0.0;
      toe_rear = 0.15;
      caster = 5.5;
      break;
    case 'Street':
    case 'Road':
      camber_front = -1.5;
      camber_rear = -1.2;
      toe_front = 0.0;
      toe_rear = 0.1;
      caster = 5.5;
      break;
    case 'Cruise':
      camber_front = -1.0;
      camber_rear = -0.8;
      toe_front = 0.0;
      toe_rear = 0.05;
      caster = 5.0;
      break;
  }
  
  return { camber_front, camber_rear, toe_front, toe_rear, caster };
}

/**
 * Calculate damping based on springs and tune type
 */
function calculateDamping(springs: { spring_front: number; spring_rear: number }, tuneType: TuneType): Partial<TuneOutput> {
  // Damping proportional to spring rate (rule of thumb: ~1.5% of spring rate)
  const rebound_multiplier = tuneType === 'Race' ? 0.017 : tuneType === 'Drift' ? 0.014 : 0.016;
  const compression_multiplier = rebound_multiplier * 0.75;
  
  return {
    damping_rebound_front: parseFloat((springs.spring_front * rebound_multiplier).toFixed(1)),
    damping_rebound_rear: parseFloat((springs.spring_rear * rebound_multiplier).toFixed(1)),
    damping_compression_front: parseFloat((springs.spring_front * compression_multiplier).toFixed(1)),
    damping_compression_rear: parseFloat((springs.spring_rear * compression_multiplier).toFixed(1))
  };
}

/**
 * Calculate tire settings based on weight and tune type
 */
function calculateTires(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  let compound = 'Street';
  let pressure_front = 32;
  let pressure_rear = 30;
  
  switch (tuneType) {
    case 'Race':
      compound = 'Race';
      pressure_front = 30;
      pressure_rear = 28;
      break;
    case 'Drift':
      compound = 'Drift';
      pressure_front = 28;
      pressure_rear = 26;
      break;
    case 'Drag':
      compound = 'Drag';
      pressure_front = 35;
      pressure_rear = 22; // Soft rear for traction
      break;
    case 'Offroad':
      compound = 'Offroad';
      pressure_front = 26;
      pressure_rear = 24;
      break;
    case 'Rally':
      compound = 'Rally';
      pressure_front = 27;
      pressure_rear = 25;
      break;
    case 'Street':
    case 'Road':
      compound = 'Street';
      pressure_front = 32;
      pressure_rear = 30;
      break;
    case 'Cruise':
      compound = 'Street';
      pressure_front = 33;
      pressure_rear = 31;
      break;
  }
  
  // Adjust for drivetrain
  if (car.drivetrain === 'RWD') {
    pressure_rear -= 1; // Slightly softer rear for traction
  } else if (car.drivetrain === 'FWD') {
    pressure_front -= 1; // Slightly softer front for traction
  }
  
  return {
    tire_compound: compound,
    tire_pressure_front: pressure_front,
    tire_pressure_rear: pressure_rear
  };
}

/**
 * Calculate aero based on PI and tune type
 */
function calculateAero(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  let downforce_front = 100;
  let downforce_rear = 150;
  
  switch (tuneType) {
    case 'Race':
      // Higher PI = more downforce available
      downforce_front = car.pi > 850 ? 200 : 150;
      downforce_rear = car.pi > 850 ? 300 : 200;
      break;
    case 'Drift':
      downforce_front = 50;
      downforce_rear = 80;
      break;
    case 'Drag':
      downforce_front = 0;
      downforce_rear = 0;
      break;
    case 'Offroad':
      downforce_front = 0;
      downforce_rear = 0;
      break;
    case 'Rally':
      downforce_front = 80;
      downforce_rear = 120;
      break;
    case 'Street':
    case 'Road':
      downforce_front = 100;
      downforce_rear = 150;
      break;
    case 'Cruise':
      downforce_front = 60;
      downforce_rear = 90;
      break;
  }
  
  return { downforce_front, downforce_rear };
}

/**
 * Calculate electronics and power mapping
 */
function calculateElectronics(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  let traction_control_level = 1;
  let abs_level = 1;
  let stability_control = 1;
  let turbo_map = 0.8;
  
  switch (tuneType) {
    case 'Race':
      traction_control_level = 0;
      abs_level = 0;
      stability_control = 0;
      turbo_map = 0.9;
      break;
    case 'Drift':
      traction_control_level = 0;
      abs_level = 0;
      stability_control = 0;
      turbo_map = 1.0;
      break;
    case 'Drag':
      traction_control_level = 0;
      abs_level = 0;
      stability_control = 0;
      turbo_map = 1.0;
      break;
    case 'Offroad':
      traction_control_level = 2;
      abs_level = 1;
      stability_control = 1;
      turbo_map = 0.85;
      break;
    case 'Rally':
      traction_control_level = 1;
      abs_level = 1;
      stability_control = 1;
      turbo_map = 0.88;
      break;
    case 'Street':
    case 'Road':
      traction_control_level = 1;
      abs_level = 1;
      stability_control = 1;
      turbo_map = 0.8;
      break;
    case 'Cruise':
      traction_control_level = 2;
      abs_level = 2;
      stability_control = 2;
      turbo_map = 0.75;
      break;
  }
  
  // Adjust for power - high power RWD needs more TC
  if (car.drivetrain === 'RWD' && powerToWeightRatio(car) > 0.25) {
    traction_control_level = Math.min(traction_control_level + 1, 2);
  }
  
  return {
    traction_control_level,
    abs_level,
    stability_control,
    turbo_map
  };
}

/**
 * Calculate brake settings
 */
function calculateBrakes(car: Car, tuneType: TuneType): Partial<TuneOutput> {
  let bias = 52;
  let pressure = 100;
  
  switch (tuneType) {
    case 'Race':
      bias = 55;
      pressure = 105;
      break;
    case 'Drift':
      bias = 60; // Rear bias for handbrake
      pressure = 100;
      break;
    case 'Drag':
      bias = 70; // Front bias to keep car straight
      pressure = 110;
      break;
    case 'Offroad':
      bias = 50;
      pressure = 95;
      break;
    case 'Rally':
      bias = 51;
      pressure = 100;
      break;
    case 'Street':
    case 'Road':
      bias = 52;
      pressure = 100;
      break;
    case 'Cruise':
      bias = 53;
      pressure = 100;
      break;
  }
  
  // Adjust for drivetrain
  if (car.drivetrain === 'FWD') {
    bias += 3; // More front bias
  } else if (car.drivetrain === 'RWD') {
    bias -= 2; // More rear bias
  }
  
  return {
    brake_bias: bias,
    brake_pressure: pressure
  };
}

/**
 * Apply weather modifiers to tune
 */
function applyWeatherModifiers(tune: TuneOutput, weather: WeatherPreset): TuneOutput {
  if (weather === 'Wet') {
    return {
      ...tune,
      tire_pressure_front: tune.tire_pressure_front - 2,
      tire_pressure_rear: tune.tire_pressure_rear - 2,
      differential_accel: Math.max(10, tune.differential_accel - 10),
      camber_front: tune.camber_front - 0.3,
      camber_rear: tune.camber_rear - 0.3,
      toe_rear: tune.toe_rear + 0.05,
      downforce_front: tune.downforce_front + 20,
      downforce_rear: tune.downforce_rear + 30,
      traction_control_level: Math.min(2, tune.traction_control_level + 1)
    };
  }
  return tune;
}

/**
 * Main tuning engine - generates complete tune based on inputs
 */
export function calculateTune(
  car: Car,
  upgrades: UpgradeSelection,
  tuneType: TuneType,
  weather: WeatherPreset
): TuneOutput {
  // Calculate each subsystem
  const gearing = calculateGearing(car, tuneType);
  const differential = calculateDifferential(car, tuneType);
  const suspension = calculateSuspension(car, tuneType);
  const alignment = calculateAlignment(car, tuneType);
  const damping = calculateDamping(suspension as any, tuneType);
  const tires = calculateTires(car, tuneType);
  const aero = calculateAero(car, tuneType);
  const electronics = calculateElectronics(car, tuneType);
  const brakes = calculateBrakes(car, tuneType);
  
  // Assemble complete tune
  let tune: TuneOutput = {
    ...gearing,
    ...differential,
    ...brakes,
    ...suspension,
    ...alignment,
    ...damping,
    ...tires,
    ...aero,
    ...electronics,
  } as TuneOutput;
  
  // Apply upgrade modifiers
  if (upgrades.Platform?.Springs === 'Race') {
    tune.spring_front += 50;
    tune.spring_rear += 50;
  } else if (upgrades.Platform?.Springs === 'Rally') {
    tune.spring_front -= 50;
    tune.spring_rear -= 50;
    tune.ride_height_front += 3;
    tune.ride_height_rear += 3;
  }
  
  if (upgrades.Aero?.['Rear Wing'] === 'Race') {
    tune.downforce_rear += 50;
  }
  
  // Apply weather modifiers
  tune = applyWeatherModifiers(tune, weather);
  
  return tune;
}

/**
 * Format tune output as human-readable text for FH5
 */
export function formatTuneForFH5(tune: TuneOutput, car: Car, tuneType: TuneType): string {
  return `
╔════════════════════════════════════════════════════════════╗
║              FORZA HORIZON 5 TUNE SHEET                    ║
╚════════════════════════════════════════════════════════════╝

CAR: ${car.year} ${car.manufacturer} ${car.model}
PI: ${car.pi} | ${car.drivetrain} | ${car.power_hp}hp @ ${car.weight_lbs}lbs
TUNE TYPE: ${tuneType}

────────────────────────────────────────────────────────────
  GEARING
────────────────────────────────────────────────────────────
Final Drive:     ${tune.final_drive.toFixed(2)}
1st Gear:        ${tune.gear_ratios[0].toFixed(2)}
2nd Gear:        ${tune.gear_ratios[1].toFixed(2)}
3rd Gear:        ${tune.gear_ratios[2].toFixed(2)}
4th Gear:        ${tune.gear_ratios[3].toFixed(2)}
5th Gear:        ${tune.gear_ratios[4].toFixed(2)}
6th Gear:        ${tune.gear_ratios[5].toFixed(2)}

────────────────────────────────────────────────────────────
  DIFFERENTIAL
────────────────────────────────────────────────────────────
Acceleration:    ${tune.differential_accel}%
Deceleration:    ${tune.differential_decel}%
${tune.center_diff ? `Center Balance:  ${tune.center_diff}%` : ''}
${tune.front_diff ? `Front Diff:      ${tune.front_diff}%` : ''}
${tune.rear_diff ? `Rear Diff:       ${tune.rear_diff}%` : ''}

────────────────────────────────────────────────────────────
  BRAKES
────────────────────────────────────────────────────────────
Balance:         ${tune.brake_bias}%
Pressure:        ${tune.brake_pressure}%

────────────────────────────────────────────────────────────
  SPRINGS & ANTI-ROLL BARS
────────────────────────────────────────────────────────────
Front Springs:   ${tune.spring_front.toFixed(1)} lb/in
Rear Springs:    ${tune.spring_rear.toFixed(1)} lb/in
Front ARB:       ${tune.arb_front.toFixed(1)}
Rear ARB:        ${tune.arb_rear.toFixed(1)}

────────────────────────────────────────────────────────────
  RIDE HEIGHT
────────────────────────────────────────────────────────────
Front:           ${tune.ride_height_front.toFixed(1)} cm
Rear:            ${tune.ride_height_rear.toFixed(1)} cm

────────────────────────────────────────────────────────────
  ALIGNMENT
────────────────────────────────────────────────────────────
Front Camber:    ${tune.camber_front.toFixed(1)}°
Rear Camber:     ${tune.camber_rear.toFixed(1)}°
Front Toe:       ${tune.toe_front.toFixed(1)}°
Rear Toe:        ${tune.toe_rear.toFixed(1)}°
Caster:          ${tune.caster.toFixed(1)}°

────────────────────────────────────────────────────────────
  DAMPING
────────────────────────────────────────────────────────────
Front Rebound:   ${tune.damping_rebound_front.toFixed(1)}
Rear Rebound:    ${tune.damping_rebound_rear.toFixed(1)}
Front Bump:      ${tune.damping_compression_front.toFixed(1)}
Rear Bump:       ${tune.damping_compression_rear.toFixed(1)}

────────────────────────────────────────────────────────────
  TIRES
────────────────────────────────────────────────────────────
Compound:        ${tune.tire_compound}
Front Pressure:  ${tune.tire_pressure_front.toFixed(1)} psi
Rear Pressure:   ${tune.tire_pressure_rear.toFixed(1)} psi

────────────────────────────────────────────────────────────
  AERO
────────────────────────────────────────────────────────────
Front Downforce: ${tune.downforce_front} kg
Rear Downforce:  ${tune.downforce_rear} kg

────────────────────────────────────────────────────────────
  POWER & ASSISTS
────────────────────────────────────────────────────────────
Turbo Mapping:   ${(tune.turbo_map * 100).toFixed(0)}%
Traction Control: ${tune.traction_control_level}
ABS:             ${tune.abs_level}
Stability:       ${tune.stability_control}

`.trim();
}
