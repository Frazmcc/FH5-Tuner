// src/components/CarPicker.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { loadCars, Car } from '../utils/loadCars';

const uniqueSorted = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>a.localeCompare(b));

export default function CarPicker({ onSelect }: { onSelect?: (c: Car|null)=>void }) {
  const cars = useMemo(() => loadCars(), []);
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');

  const manufacturers = useMemo(() => uniqueSorted(cars.map(c=>c.manufacturer)), [cars]);
  const modelsForManufacturer = useMemo(() => {
    if (!manufacturer) return [];
    return uniqueSorted(cars.filter(c=>c.manufacturer===manufacturer).map(c=>c.model));
  }, [cars, manufacturer]);

  const selectedCar = useMemo(() => {
    if (!manufacturer || !model) return null;
    // pick the first row matching manufacturer+model (you can extend to allow year)
    return cars.find(c => c.manufacturer === manufacturer && c.model === model) ?? null;
  }, [cars, manufacturer, model]);

  useEffect(()=> { if (onSelect) onSelect(selectedCar); }, [selectedCar, onSelect]);

  // helper to format displayed label
  const labelFor = (c?: Car|null) => {
    if (!c) return '';
    const parts = [];
    if (typeof c.pi === 'number') parts.push(`PI ${c.pi}`);
    if (typeof c.power_hp === 'number') parts.push(`${c.power_hp} hp`);
    if (typeof c.weight_lbs === 'number') parts.push(`@ ${c.weight_lbs} lbs`);
    return `${c.manufacturer} ${c.model}${c.year ? ' ' + c.year : ''} — ${parts.join(' | ')}`;
  };

  return (
    <div>
      <label>Manufacturer</label>
      <select value={manufacturer} onChange={e=>{ setManufacturer(e.target.value); setModel(''); }}>
        <option value="">— Select manufacturer —</option>
        {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <label>Model</label>
      <select disabled={!manufacturer} value={model} onChange={e=>setModel(e.target.value)}>
        <option value="">{manufacturer ? '— Select model —' : '— Select manufacturer first —'}</option>
        {modelsForManufacturer.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <div style={{marginTop:12}}>
        <strong>Preview:</strong>
        <div style={{padding:8, border:'1px solid #eee'}}>{labelFor(selectedCar)}</div>
      </div>
    </div>
  );
}
