import { describe, it, expect } from 'vitest';
import { calculateTune, formatTuneForFH5, type Car } from '../src/tuner/engine';

// Test car fixtures
const gtrR35: Car = {
  manufacturer: 'Nissan',
  model: 'GT-R (R35)',
  year: 2017,
  pi: 800,
  drivetrain: 'AWD',
  power_hp: 565,
  weight_lbs: 3865,
  engine_type: 'V6',
  aspiration: 'Twin Turbo',
  displacement_l: 3.8
};

const porsche911GT3: Car = {
  manufacturer: 'Porsche',
  model: '911 GT3 RS',
  year: 2019,
  pi: 898,
  drivetrain: 'RWD',
  power_hp: 520,
  weight_lbs: 3153,
  engine_type: 'Flat-6',
  aspiration: 'Naturally Aspirated',
  displacement_l: 4.0
};

const civicTypeR: Car = {
  manufacturer: 'Honda',
  model: 'Civic Type R',
  year: 2018,
  pi: 655,
  drivetrain: 'FWD',
  power_hp: 306,
  weight_lbs: 3117,
  engine_type: 'I4',
  aspiration: 'Turbo',
  displacement_l: 2.0
};

describe('Tuning Engine', () => {
  describe('calculateTune', () => {
    it('should generate a complete tune for GT-R with Race/Dry settings', () => {
      const tune = calculateTune(gtrR35, {}, 'Race', 'Dry');

      // Check all required fields exist
      expect(tune).toHaveProperty('final_drive');
      expect(tune).toHaveProperty('gear_ratios');
      expect(tune).toHaveProperty('differential_accel');
      expect(tune).toHaveProperty('brake_bias');
      expect(tune).toHaveProperty('spring_front');
      expect(tune).toHaveProperty('tire_pressure_front');
      expect(tune).toHaveProperty('downforce_front');

      // Check gear ratios array
      expect(tune.gear_ratios).toHaveLength(6);
      
      // Check reasonable ranges
      expect(tune.final_drive).toBeGreaterThan(2.0);
      expect(tune.final_drive).toBeLessThan(6.0);
      
      expect(tune.tire_pressure_front).toBeGreaterThan(10);
      expect(tune.tire_pressure_front).toBeLessThan(50);
      
      expect(tune.camber_front).toBeGreaterThan(-5);
      expect(tune.camber_front).toBeLessThan(0);
    });

    it('should have AWD-specific differential settings for GT-R', () => {
      const tune = calculateTune(gtrR35, {}, 'Race', 'Dry');

      expect(tune).toHaveProperty('center_diff');
      expect(tune).toHaveProperty('front_diff');
      expect(tune).toHaveProperty('rear_diff');
      
      expect(tune.center_diff).toBeDefined();
      expect(tune.front_diff).toBeDefined();
      expect(tune.rear_diff).toBeDefined();
    });

    it('should not have AWD settings for RWD car', () => {
      const tune = calculateTune(porsche911GT3, {}, 'Race', 'Dry');

      // These should exist but be undefined for RWD
      expect(tune.center_diff).toBeUndefined();
      expect(tune.front_diff).toBeUndefined();
      expect(tune.rear_diff).toBeUndefined();
    });

    it('should apply weather modifiers for wet conditions', () => {
      const dryTune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const wetTune = calculateTune(gtrR35, {}, 'Race', 'Wet');

      // Wet should have lower tire pressures
      expect(wetTune.tire_pressure_front).toBeLessThan(dryTune.tire_pressure_front);
      expect(wetTune.tire_pressure_rear).toBeLessThan(dryTune.tire_pressure_rear);

      // Wet should have lower differential accel
      expect(wetTune.differential_accel).toBeLessThan(dryTune.differential_accel);

      // Wet should have more camber
      expect(wetTune.camber_front).toBeLessThan(dryTune.camber_front);

      // Wet should have more downforce
      expect(wetTune.downforce_front).toBeGreaterThan(dryTune.downforce_front);
      expect(wetTune.downforce_rear).toBeGreaterThan(dryTune.downforce_rear);
    });

    it('should generate different settings for different tune types', () => {
      const raceTune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const driftTune = calculateTune(gtrR35, {}, 'Drift', 'Dry');
      const dragTune = calculateTune(gtrR35, {}, 'Drag', 'Dry');

      // Drift should have much lower differential accel
      expect(driftTune.differential_accel).toBeLessThan(raceTune.differential_accel);

      // Drag should have higher final drive
      expect(dragTune.final_drive).toBeGreaterThan(raceTune.final_drive);

      // Race should have stiffer springs than drift
      expect(raceTune.spring_front).toBeGreaterThan(driftTune.spring_front);
    });

    it('should respect upgrade modifiers', () => {
      const baseTune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const upgradedTune = calculateTune(
        gtrR35,
        {
          Platform: { Springs: 'Race' },
          Aero: { 'Rear Wing': 'Race' }
        },
        'Race',
        'Dry'
      );

      // Race springs should increase spring rates
      expect(upgradedTune.spring_front).toBeGreaterThan(baseTune.spring_front);
      expect(upgradedTune.spring_rear).toBeGreaterThan(baseTune.spring_rear);

      // Race wing should increase rear downforce
      expect(upgradedTune.downforce_rear).toBeGreaterThan(baseTune.downforce_rear);
    });

    it('should produce different tunes for different drivetrains', () => {
      const awdTune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const rwdTune = calculateTune(porsche911GT3, {}, 'Race', 'Dry');
      const fwdTune = calculateTune(civicTypeR, {}, 'Race', 'Dry');

      // Different brake bias for different drivetrains
      expect(awdTune.brake_bias).not.toEqual(rwdTune.brake_bias);
      expect(fwdTune.brake_bias).not.toEqual(rwdTune.brake_bias);

      // FWD should have higher brake bias (more front)
      expect(fwdTune.brake_bias).toBeGreaterThan(rwdTune.brake_bias);
    });

    it('should validate tire pressures are within realistic range', () => {
      const tunes = [
        calculateTune(gtrR35, {}, 'Race', 'Dry'),
        calculateTune(gtrR35, {}, 'Drift', 'Wet'),
        calculateTune(porsche911GT3, {}, 'Drag', 'Dry'),
        calculateTune(civicTypeR, {}, 'Offroad', 'Wet')
      ];

      tunes.forEach(tune => {
        expect(tune.tire_pressure_front).toBeGreaterThanOrEqual(15);
        expect(tune.tire_pressure_front).toBeLessThanOrEqual(40);
        expect(tune.tire_pressure_rear).toBeGreaterThanOrEqual(15);
        expect(tune.tire_pressure_rear).toBeLessThanOrEqual(40);
      });
    });

    it('should validate gear ratios are in descending order', () => {
      const tune = calculateTune(gtrR35, {}, 'Race', 'Dry');

      for (let i = 0; i < tune.gear_ratios.length - 1; i++) {
        expect(tune.gear_ratios[i]).toBeGreaterThan(tune.gear_ratios[i + 1]);
      }
    });

    it('should validate camber is negative', () => {
      const tunes = [
        calculateTune(gtrR35, {}, 'Race', 'Dry'),
        calculateTune(porsche911GT3, {}, 'Drift', 'Dry'),
        calculateTune(civicTypeR, {}, 'Street', 'Wet')
      ];

      tunes.forEach(tune => {
        expect(tune.camber_front).toBeLessThan(0);
        expect(tune.camber_rear).toBeLessThan(0);
        expect(tune.camber_front).toBeGreaterThan(-5);
        expect(tune.camber_rear).toBeGreaterThan(-5);
      });
    });
  });

  describe('formatTuneForFH5', () => {
    it('should format tune as human-readable text', () => {
      const tune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const formatted = formatTuneForFH5(tune, gtrR35, 'Race');

      expect(formatted).toContain('FORZA HORIZON 5 TUNE SHEET');
      expect(formatted).toContain('Nissan');
      expect(formatted).toContain('GT-R');
      expect(formatted).toContain('GEARING');
      expect(formatted).toContain('DIFFERENTIAL');
      expect(formatted).toContain('BRAKES');
      expect(formatted).toContain('Final Drive:');
      expect(formatted).toContain('psi');
    });

    it('should include AWD differential info for AWD cars', () => {
      const tune = calculateTune(gtrR35, {}, 'Race', 'Dry');
      const formatted = formatTuneForFH5(tune, gtrR35, 'Race');

      expect(formatted).toContain('Center Balance:');
      expect(formatted).toContain('Front Diff:');
      expect(formatted).toContain('Rear Diff:');
    });

    it('should not include AWD differential info for RWD cars', () => {
      const tune = calculateTune(porsche911GT3, {}, 'Race', 'Dry');
      const formatted = formatTuneForFH5(tune, porsche911GT3, 'Race');

      expect(formatted).not.toContain('Center Balance:');
      expect(formatted).not.toContain('Front Diff:');
      expect(formatted).not.toContain('Rear Diff:');
    });
  });
});
