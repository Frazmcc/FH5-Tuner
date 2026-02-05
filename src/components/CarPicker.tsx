import { useMemo, useState, useEffect, ChangeEvent } from 'react';
import { loadCars, Car } from '../utils/loadCars';

type Props = {
  onSelect?: (car: Car | null) => void;
  initialManufacturer?: string;
  initialModel?: string;
  showYearSelector?: boolean; // still supported but default UX will set year from model selection
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

type ModelYear = { model: string; year: number | '' };

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

  // manufacturers list (unique, sorted)
  const manufacturers = useMemo(() => {
    const names = cars.map((c) => c.manufacturer);
    return uniqueSortedPreserveCase(names);
  }, [cars]);

  // model+year variants for the selected manufacturer
  const modelYearOptions = useMemo(() => {
    if (!manufacturer) return [] as ModelYear[];

    // collect {model, year} from cars for the manufacturer
    const variants = cars
      .filter((c) => c.manufacturer === manufacturer)
      .map((c) => ({ model: c.model, year: c.year ?? '' as number | '' }));

    // dedupe by case-insensitive model + year, preserve first-seen casing
    const map = new Map<string, ModelYear>();
    for (const v of variants) {
      const key = `${String(v.model).trim().toLowerCase()}|${String(v.year)}`;
      if (!map.has(key)) map.set(key, v);
    }

    // convert to array and sort by year desc (missing year last), then model asc
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const ay = typeof a.year === 'number' ? a.year : -1;
      const by = typeof b.year === 'number' ? b.year : -1;
      if (ay !== by) return by - ay; // newer years first
      return a.model.localeCompare(b.model);
    });
    return arr;
  }, [cars, manufacturer]);

  // helper to format option label as "YEAR / MODEL" (or "MODEL" if year missing)
  function formatModelYearLabel(m: ModelYear) {
    return m.year ? `${m.year} / ${m.model}` : m.model;
  }

  // selected car object (prefers explicit year if set)
  const selectedCar = useMemo(() => {
    if (!manufacturer || !model) return null;
    // if year set, match exact row; otherwise pick first matching model
    if (year && typeof year === 'number') {
      return cars.find((c) => c.manufacturer === manufacturer && c.model === model && c.year === year) ?? null;
    }
    return cars.find((c) => c.manufacturer === manufacturer && c.model === model) ?? null;
  }, [cars, manufacturer, model, year]);

  // notify parent when selection changes
  useEffect(() => {
    if (onSelect) onSelect(selectedCar);
  }, [selectedCar, onSelect]);

  // reset model/year if manufacturer changes and selection invalid
  useEffect(() => {
    if (manufacturer) {
      // if current model isn't in new manufacturer's variants, reset
      const found = modelYearOptions.some((opt) => opt.model === model && opt.year === year);
      if (!found) {
        setModel('');
        setYear('');
      }
    } else {
      setModel('');
      setYear('');
    }
  }, [manufacturer, modelYearOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // reset year when model changes (unless model selection sets year)
  useEffect(() => {
    // keep current year only if it matches an available variant for (manufacturer, model)
    if (model) {
      const match = modelYearOptions.find((opt) => opt.model === model && opt.year === year);
      if (!match) {
        setYear('');
      }
    } else {
      setYear('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  function handleManufacturerChange(e: ChangeEvent<HTMLSelectElement>) {
    setManufacturer(e.target.value);
    setModel('');
    setYear('');
  }

  function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    // value will be encoded as "model|||year" or just "model|||" if no year
    // we encode as JSON string to avoid separator issues
    try {
      const parsed = JSON.parse(val) as ModelYear;
      setModel(parsed.model);
      setYear(parsed.year ?? '');
    } catch {
      // fallback - treat as raw model string
      setModel(val);
      setYear('');
    }
  }

  // small preview label for the selected car
  function labelFor(c?: Car | null): string {
    if (!c) return '';
    const parts: string[] = [];
    if (typeof c.pi === 'number') parts.push(`PI ${c.pi}`);
    if (typeof c.power_hp === 'number') parts.push(`${c.power_hp} hp`);
    if (typeof c.weight_lbs === 'number') parts.push(`@ ${c.weight_lbs} lbs`);
    return `${c.year ? c.year + ' / ' : ''}${c.manufacturer} ${c.model}${parts.length ? ' — ' + parts.join(' | ') : ''}`;
  }

  return (
    <div style={{ maxWidth: 700 }}>
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
        Model (Year)
      </label>
      <select
        id="model-select"
        value={model ? JSON.stringify({ model, year }) : ''}
        onChange={handleModelChange}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
        disabled={!manufacturer}
      >
        <option value="">{manufacturer ? '— Select model (year) —' : '— Select manufacturer first —'}</option>
        {modelYearOptions.map((opt) => (
          // encode full object in value so we can set both model & year on select
          <option key={`${opt.model}|||${String(opt.year)}`} value={JSON.stringify(opt)}>
            {formatModelYearLabel(opt)}
          </option>
        ))}
      </select>

      {/* keep optional year selector if you still want to override year separately */}
      {showYearSelector && model && (
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
            {Array.from(
              new Set(
                cars
                  .filter((c) => c.manufacturer === manufacturer && c.model === model)
                  .map((c) => c.year)
                  .filter((y): y is number => typeof y === 'number'),
              ),
            )
              .sort((a, b) => b - a)
              .map((y) => (
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
