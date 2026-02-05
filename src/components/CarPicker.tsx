import React, { useEffect, useMemo, useState } from 'react';
import { loadCars, Car } from '../utils/loadCars';

type Props = {
  onSelect?: (car: Car | null) => void;
  initialManufacturer?: string;
  initialModel?: string;
  // optional: show year selector if multiple variants exist
  showYearSelector?: boolean;
};

const uniqueSorted = (arr: string[]) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

export const CarPicker: React.FC<Props> = ({ onSelect, initialManufacturer = '', initialModel = '', showYearSelector = false }) => {
  const cars = useMemo(() => loadCars(), []);
  const [manufacturer, setManufacturer] = useState<string>(initialManufacturer);
  const [model, setModel] = useState<string>(initialModel);
  const [year, setYear] = useState<number | ''>('');

  // Build list of unique manufacturers (only the name)
  const manufacturers = useMemo(() => {
    const names = cars.map(c => c.Manufacturer);
    return uniqueSorted(names);
  }, [cars]);

  // Models for selected manufacturer (unique + sorted)
  const modelsForManufacturer = useMemo(() => {
    if (!manufacturer) return [] as string[];
    const filtered = cars.filter(c => c.Manufacturer === manufacturer).map(c => c.Model);
    return uniqueSorted(filtered);
  }, [cars, manufacturer]);

  // If showYearSelector is true, compute years for selected manufacturer+model
  const yearsForSelection = useMemo(() => {
    if (!manufacturer || !model) return [] as number[];
    const years = cars
      .filter(c => c.Manufacturer === manufacturer && c.Model === model)
      .map(c => (c.Year ?? null))
      .filter((y): y is number => typeof y === 'number');
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [cars, manufacturer, model]);

  // Selected car: prefer exact year match if set; otherwise first match for manufacturer+model
  const selectedCar = useMemo(() => {
    if (!manufacturer || !model) return null;
    const candidates = cars.filter(c => c.Manufacturer === manufacturer && c.Model === model);
    if (candidates.length === 0) return null;
    if (year && typeof year === 'number') {
      const byYear = candidates.find(c => c.Year === year);
      if (byYear) return byYear;
    }
    return candidates[0];
  }, [cars, manufacturer, model, year]);

  // notify parent when selection changes
  useEffect(() => {
    if (onSelect) onSelect(selectedCar);
  }, [selectedCar, onSelect]);

  // if manufacturer changes, reset model/year if not available
  useEffect(() => {
    if (manufacturer && model && !modelsForManufacturer.includes(model)) {
      setModel('');
      setYear('');
    }
  }, [manufacturer, modelsForManufacturer, model]);

  // if model changes, reset year
  useEffect(() => {
    setYear('');
  }, [model]);

  return (
    <div style={{ maxWidth: 560 }}>
      <label htmlFor="manufacturer-select" style={{ display: 'block', marginBottom: 6 }}>
        Manufacturer
      </label>
      <select
        id="manufacturer-select"
        value={manufacturer}
        onChange={e => setManufacturer(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      >
        <option value="">— Select manufacturer —</option>
        {manufacturers.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <label htmlFor="model-select" style={{ display: 'block', marginBottom: 6 }}>
        Model
      </label>
      <select
        id="model-select"
        value={model}
        onChange={e => setModel(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
        disabled={!manufacturer}
      >
        <option value="">{manufacturer ? '— Select model —' : '— Select manufacturer first —'}</option>
        {modelsForManufacturer.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {showYearSelector && modelsForManufacturer.length > 0 && (
        <>
          <label htmlFor="year-select" style={{ display: 'block', marginBottom: 6 }}>
            Year / Variant
          </label>
          <select
            id="year-select"
            value={year === '' ? '' : String(year)}
            onChange={e => {
              const v = e.target.value;
              setYear(v === '' ? '' : Number(v));
            }}
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
            disabled={!model}
          >
            <option value="">{model ? '— Select year (optional) —' : '— Select model first —'}</option>
            {yearsForSelection.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </>
      )}

      <div style={{ marginTop: 8 }}>
        {selectedCar ? (
          <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
            <strong>
              {selectedCar.Manufacturer} {selectedCar.Model} {selectedCar.Year ?? ''}
            </strong>
            <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
              PI: {selectedCar.PI ?? '—'} • Power: {selectedCar.Power ?? '—'} hp • Weight: {selectedCar.Weight ?? '—'} lbs
            </div>
          </div>
        ) : (
          <div style={{ color: '#777' }}>No car selected.</div>
        )}
      </div>
    </div>
  );
};

export default CarPicker;
