// Rule-based tuner that outputs numeric tune parameters based on form selections, tune type, and weather

const TUNE_PRESETS = {
  Road: {
    final_drive: 3.2,
    gear_ratios: [2.8, 1.9, 1.4, 1.1, 0.9, 0.75],
    differential_accel: 50,
    differential_decel: 20,
    differential_preload: 30,
    brake_bias: 52,
    spring_front: 450,
    spring_rear: 400,
    arb_front: 25,
    arb_rear: 22,
    ride_height_front: 10,
    ride_height_rear: 11,
    camber_front: -1.5,
    camber_rear: -1.2,
    toe_front: 0.0,
    toe_rear: 0.1,
    damping_rebound_front: 8.0,
    damping_rebound_rear: 7.5,
    damping_compression_front: 6.5,
    damping_compression_rear: 6.0,
    tire_pressure_front: 32,
    tire_pressure_rear: 30,
    downforce_front: 100,
    downforce_rear: 150,
    turbo_map: 0.8,
    traction_control_level: 1,
    abs_level: 1
  },
  Race: {
    final_drive: 3.5,
    gear_ratios: [3.0, 2.1, 1.5, 1.2, 1.0, 0.85],
    differential_accel: 75,
    differential_decel: 15,
    differential_preload: 40,
    brake_bias: 55,
    spring_front: 600,
    spring_rear: 550,
    arb_front: 30,
    arb_rear: 28,
    ride_height_front: 6,
    ride_height_rear: 7,
    camber_front: -2.5,
    camber_rear: -2.0,
    toe_front: -0.1,
    toe_rear: 0.2,
    damping_rebound_front: 10.0,
    damping_rebound_rear: 9.5,
    damping_compression_front: 8.0,
    damping_compression_rear: 7.5,
    tire_pressure_front: 30,
    tire_pressure_rear: 28,
    downforce_front: 200,
    downforce_rear: 300,
    turbo_map: 0.9,
    traction_control_level: 0,
    abs_level: 0
  },
  Drift: {
    final_drive: 4.2,
    gear_ratios: [3.5, 2.4, 1.7, 1.3, 1.05, 0.9],
    differential_accel: 15,
    differential_decel: 5,
    differential_preload: 10,
    brake_bias: 60,
    spring_front: 500,
    spring_rear: 480,
    arb_front: 20,
    arb_rear: 15,
    ride_height_front: 12,
    ride_height_rear: 13,
    camber_front: -3.0,
    camber_rear: -2.5,
    toe_front: 0.0,
    toe_rear: 0.3,
    damping_rebound_front: 7.0,
    damping_rebound_rear: 6.5,
    damping_compression_front: 5.5,
    damping_compression_rear: 5.0,
    tire_pressure_front: 28,
    tire_pressure_rear: 26,
    downforce_front: 50,
    downforce_rear: 80,
    turbo_map: 1.0,
    traction_control_level: 0,
    abs_level: 0
  },
  Offroad: {
    final_drive: 3.8,
    gear_ratios: [3.2, 2.2, 1.6, 1.25, 1.0, 0.82],
    differential_accel: 60,
    differential_decel: 30,
    differential_preload: 35,
    brake_bias: 50,
    spring_front: 350,
    spring_rear: 320,
    arb_front: 18,
    arb_rear: 16,
    ride_height_front: 18,
    ride_height_rear: 19,
    camber_front: -1.0,
    camber_rear: -0.8,
    toe_front: 0.0,
    toe_rear: 0.1,
    damping_rebound_front: 9.0,
    damping_rebound_rear: 8.5,
    damping_compression_front: 7.0,
    damping_compression_rear: 6.5,
    tire_pressure_front: 26,
    tire_pressure_rear: 24,
    downforce_front: 0,
    downforce_rear: 0,
    turbo_map: 0.85,
    traction_control_level: 2,
    abs_level: 1
  },
  Rally: {
    final_drive: 3.6,
    gear_ratios: [3.1, 2.15, 1.55, 1.22, 0.98, 0.8],
    differential_accel: 65,
    differential_decel: 25,
    differential_preload: 38,
    brake_bias: 51,
    spring_front: 380,
    spring_rear: 350,
    arb_front: 20,
    arb_rear: 18,
    ride_height_front: 15,
    ride_height_rear: 16,
    camber_front: -1.5,
    camber_rear: -1.2,
    toe_front: 0.0,
    toe_rear: 0.15,
    damping_rebound_front: 8.5,
    damping_rebound_rear: 8.0,
    damping_compression_front: 6.8,
    damping_compression_rear: 6.3,
    tire_pressure_front: 27,
    tire_pressure_rear: 25,
    downforce_front: 80,
    downforce_rear: 120,
    turbo_map: 0.88,
    traction_control_level: 1,
    abs_level: 1
  },
  Cruise: {
    final_drive: 3.0,
    gear_ratios: [2.6, 1.8, 1.3, 1.05, 0.88, 0.72],
    differential_accel: 45,
    differential_decel: 25,
    differential_preload: 28,
    brake_bias: 53,
    spring_front: 400,
    spring_rear: 380,
    arb_front: 22,
    arb_rear: 20,
    ride_height_front: 12,
    ride_height_rear: 13,
    camber_front: -1.0,
    camber_rear: -0.8,
    toe_front: 0.0,
    toe_rear: 0.05,
    damping_rebound_front: 7.5,
    damping_rebound_rear: 7.0,
    damping_compression_front: 6.0,
    damping_compression_rear: 5.5,
    tire_pressure_front: 33,
    tire_pressure_rear: 31,
    downforce_front: 60,
    downforce_rear: 90,
    turbo_map: 0.75,
    traction_control_level: 2,
    abs_level: 2
  },
  Drag: {
    final_drive: 4.5,
    gear_ratios: [3.8, 2.6, 1.85, 1.4, 1.15, 0.95],
    differential_accel: 100,
    differential_decel: 10,
    differential_preload: 50,
    brake_bias: 70,
    spring_front: 550,
    spring_rear: 650,
    arb_front: 15,
    arb_rear: 10,
    ride_height_front: 5,
    ride_height_rear: 8,
    camber_front: -2.0,
    camber_rear: -1.5,
    toe_front: 0.0,
    toe_rear: 0.0,
    damping_rebound_front: 9.5,
    damping_rebound_rear: 10.0,
    damping_compression_front: 7.5,
    damping_compression_rear: 8.0,
    tire_pressure_front: 35,
    tire_pressure_rear: 22,
    downforce_front: 0,
    downforce_rear: 0,
    turbo_map: 1.0,
    traction_control_level: 0,
    abs_level: 0
  }
};

const WET_MODIFIERS = {
  tire_pressure_front: -2,
  tire_pressure_rear: -2,
  differential_accel: -10,
  camber_front: -0.3,
  camber_rear: -0.3,
  toe_rear: 0.05,
  downforce_front: 20,
  downforce_rear: 30,
  traction_control_level: 1
};

export function calculateTune(formData, tuneType, weather) {
  // Get base preset
  const preset = TUNE_PRESETS[tuneType] || TUNE_PRESETS.Road;
  
  // Clone preset
  const tune = { ...preset };
  
  // Apply weather modifiers for wet conditions
  if (weather === 'Wet') {
    Object.keys(WET_MODIFIERS).forEach(key => {
      if (key in tune) {
        tune[key] += WET_MODIFIERS[key];
      }
    });
  }
  
  // Apply minor adjustments based on selected parts (simplified logic)
  if (formData.Engine?.Turbo && formData.Engine.Turbo !== 'None') {
    tune.turbo_map = Math.min(1.0, tune.turbo_map + 0.05);
  }
  
  if (formData.Platform?.Springs === 'Race') {
    tune.spring_front += 50;
    tune.spring_rear += 50;
  } else if (formData.Platform?.Springs === 'Rally') {
    tune.spring_front -= 50;
    tune.spring_rear -= 50;
    tune.ride_height_front += 3;
    tune.ride_height_rear += 3;
  } else if (formData.Platform?.Springs === 'Drift') {
    tune.differential_accel -= 5;
  }
  
  if (formData.Aero?.['Rear Wing'] === 'Race') {
    tune.downforce_rear += 50;
  }
  
  if (formData.Drivetrain?.Differential === 'Race') {
    tune.differential_accel += 5;
  }
  
  // Override with manual tuning values if provided
  if (formData.Tuning?.['Final Drive']) {
    const fd = parseFloat(formData.Tuning['Final Drive']);
    if (!isNaN(fd) && fd >= 2.0 && fd <= 5.0) {
      tune.final_drive = fd;
    }
  }
  
  // Override gear ratios if provided
  for (let i = 1; i <= 6; i++) {
    const gearKey = `Gear ${i} Ratio`;
    if (formData.Tuning?.[gearKey]) {
      const ratio = parseFloat(formData.Tuning[gearKey]);
      if (!isNaN(ratio) && ratio > 0) {
        tune.gear_ratios[i - 1] = ratio;
      }
    }
  }
  
  return tune;
}
