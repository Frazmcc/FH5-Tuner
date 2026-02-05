import { useMemo, useState, useEffect, ChangeEvent } from 'react';
import { loadCars, Car } from '../utils/loadCars';

type Props = {
  onSelect?: (car: Car | null) => void;
  initialManufacturer?: string;
  initialModel?: string;
  showYearSelector?: boolean;
};

function uniqueSortedPreserveCase(items: string[]): string[] {
  const map = new Map<string, string>();
  for (const it of items) {
    if (!it) continue;
    const key = it.trim();
    const lower = key.toLowerCase();
    if (!map.has(lower)) map.set(lower, key);
  }
  return Array.from(map.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

export default function CarPicker({
  onSelect,
  initialManufacturer = '',
  initialModel = '',
  showYearSelector = false,
}: Props) {
  const cars: Car[] = useMemo(() => loadCars(), []);

  const [manufacturer, setManufacturer] = useState<string>(initialManufacturer);
  const [model, setModel] = useState<string>(initialModel);
  const [year, setYear] = useState<number | ''>('');

  const manufacturers = useMemo(() => {
    const names = cars.map((c) => c.manufacturer);
    return uniqueSortedPreserveCase(names);
  }, [cars]);

  const modelsForManufacturer = useMemo(() => {
    if (!manufacturer) return [] as string[];
    const filtered = cars
      .filter((c) => c.manufacturer === manufacturer)
      .map((c) => c.model);
    return uniqueSortedPreserveCase(filtered);
  }, [cars, manufacturer]);

  const yearsForSelection = useMemo(() => {
    if (!manufacturer || !model) return [] as number[];
    const years = cars
      .filter((c) => c.manufacturer === manufacturer && c.model === model)
      .map((c) => (c.year ?? null))
      .filter((y): y is number => typeof y === 'number');
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [cars, manufacturer, model]);

  const selectedCar = useMemo(() => {
    if (!manufacturer || !model) return null;
    const candidates = cars.filter((c) => c.manufacturer === manufacturer && c.model === model);
    if (candidates.length === 0) return null;
    if (year && typeof year === 'number') {
      const byYear = candidates.find((c) => c.year === year);
      if (byYear) return byYear;
    }
    return candidates[0];
  }, [cars, manufacturer, model, year]);

  useEffect(() => {
    if (onSelect) onSelect(selectedCar);
  }, [selectedCar, onSelect]);

  useEffect(() => {
    if (manufacturer && model && !modelsForManufacturer.includes(model)) {
      setModel('');
      setYear('');
    }
  }, [manufacturer, modelsForManufacturer, model]);

  useEffect(() => {
    setYear('');
  }, [model]);

  function handleManufacturerChange(e: ChangeEvent<HTMLSelectElement>) {
    setManufacturer(e.target.value);
    setModel('');
    setYear('');
  }

  function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value);
  }

  function labelFor(c?: Car | null): string {
    if (!c) return '';
    const parts: string[] = [];
    if (typeof c.pi === 'number') parts.push(`PI ${c.pi}`);
    if (typeof c.power_hp === 'number') parts.push(`${c.power_hp} hp`);
    if (typeof c.weight_lbs === 'number') parts.push(`@ ${c.weight_lbs} lbs`);
    return `${c.manufacturer} ${c.model}${c.year ? ' ' + c.year : ''}${parts.length ? ' — ' + parts.join(' | ') : ''}`;
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <label htmlFor="manufacturer-select" style={{ display: 'block', marginBottom: 6 }}>
        Manufacturer
      </label>
      <select
        id="manufacturer-select"
        value={manufacturer}
        onChange={handleManufacturerChange}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      >
        <option value="">— Select manufacturer —</option>
        {manufacturers.map((m) => (
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
        onChange={handleModelChange}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
        disabled={!manufacturer}
      >
        <option value="">{manufacturer ? '— Select model —' : '— Select manufacturer first —'}</option>
        {modelsForManufacturer.map((m) => (
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
            onChange={(e) => {
              const v = e.target.value;
              setYear(v === '' ? '' : Number(v));
            }}
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
            disabled={!model}
          >
            <option value="">{model ? '— Select year (optional) —' : '— Select model first —'}</option>
            {yearsForSelection.map((y) => (
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
            <strong>{labelFor(selectedCar)}</strong>
          </div>
        ) : (
          <div style={{ color: '#777' }}>No car selected.</div>
        )}
      </div>
    </div>
  );
}
