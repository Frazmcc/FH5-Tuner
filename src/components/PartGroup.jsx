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

export default function PartGroup({ section, parts, selectedValues, onSelect, rims }) {
  const renderControl = (part, partData) => {
    const value = selectedValues[part] || '';

    // For rim parts render style select and then wheel select
    if (section === 'Rims') {
      // collect unique styles
      const styles = [];
      const seen = new Set();
      if (rims && rims.length) {
        for (const r of rims) {
          const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
          if (!style) continue;
          const key = style.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            styles.push(style);
          }
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
              // clear selected wheel when style changes
              onSelect(section, wheelKey, '');
            }}
          >
            <option value="">Select Style</option>
            {styles.map((s) => (
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
            {rims
              ?.filter((r) => {
                const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
                return style && value && style.toLowerCase() === value.toLowerCase();
              })
              .map((r, idx) => (
                <option key={idx} value={`${String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '')}|||${String(rimGet(r, 'Name', 'name') ?? '')}`}>
                  {rimLabel(r)}
                </option>
              ))}
          </select>
        </div>
      );
    }

    // non-rim controls: preserve existing behavior
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
