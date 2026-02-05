import React from 'react';

function rimGet(v, ...keys) {
  for (const k of keys) {
    if (v[k] !== undefined) return v[k];
  }
  return undefined;
}

function rimLabel(rim) {
  const manufacturer = String(rimGet(rim, 'Manufacturer', 'manufacturer') ?? '').trim();
  const name = String(rimGet(rim, 'Name', 'name') ?? '').trim();
  const size = rimGet(rim, 'Size', 'size');
  const price = rimGet(rim, 'Price', 'price');
  const sizeStr = size ? ` (${size})` : '';
  const priceStr = price ? ` - $${price}` : '';
  return `${manufacturer} ${name}${sizeStr}${priceStr}`.trim();
}

const FIXED_RIM_STYLES = ['Sport', 'Multi-Piece', 'Specialised', 'Stock'];

function normalizeToFixedStyle(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('sport')) return 'Sport';
  if (s.includes('multi')) return 'Multi-Piece';
  if (s.includes('split')) return 'Multi-Piece';
  if (s.includes('special') || s.includes('specialis') || s.includes('specializ')) return 'Specialised';
  if (s.includes('stock')) return 'Stock';
  for (const fs of FIXED_RIM_STYLES) {
    if (s === fs.toLowerCase()) return fs;
  }
  return 'Stock';
}

export default function PartGroup({ section, parts, selectedValues, onSelect, rims }) {
  const renderControl = (part, partData) => {
    const value = selectedValues[part] || '';

    // For rim parts render style select and then wheel select
    if (section === 'Rims') {
      // build rims grouped by normalized style
      const rimsByStyle = {
        'Sport': [],
        'Multi-Piece': [],
        'Specialised': [],
        'Stock': [],
      };

      if (rims && rims.length) {
        for (const r of rims) {
          const rawStyle = rimGet(r, 'Style', 'style') ?? '';
          const normalized = normalizeToFixedStyle(rawStyle);
          if (normalized) rimsByStyle[normalized].push(r);
        }
      }

      const wheelKey = `${part}-Rim`;
      const selectedWheel = selectedValues[wheelKey] || '';

      return (
        <div className="dropdown-group">
          <select
            value={value}
            onChange={(e) => {
              const newStyle = e.target.value;
              onSelect(section, part, newStyle);
              onSelect(section, wheelKey, '');
            }}
          >
            <option value="">Select Style</option>
            {FIXED_RIM_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedWheel}
            onChange={(e) => onSelect(section, wheelKey, e.target.value)}
            disabled={!value}
            style={{ marginTop: 8 }}
          >
            <option value="">{value ? 'Select rim...' : 'Select a style first'}</option>
            {(value && rimsByStyle[value])?.map((r, idx) => (
              <option key={idx} value={`${String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '')}|||${String(rimGet(r, 'Name', 'name') ?? '')}`}>
                {rimLabel(r)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // non-rim controls
    if (partData.control === 'button' || partData.control === 'dropdown') {
      return (
        <select value={value} onChange={(e) => onSelect(section, part, e.target.value)} className="part-select">
          <option value="">Select Option</option>
          {partData.options && partData.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (partData.control === 'text') {
      return (
        <input
          type="text"
          value={value || partData.default || ''}
          onChange={(e) => onSelect(section, part, e.target.value)}
          placeholder={partData.hint}
          className="text-input"
        />
      );
    }

    return null;
  };

  return (
    <div className="part-group">
      <h3>{section}</h3>
      {Object.entries(parts).map(([part, partData]) => (
        <div key={part} className="part-row">
          <label>{part}:</label>
          {renderControl(part, partData)}
        </div>
      ))}
    </div>
  );
}
