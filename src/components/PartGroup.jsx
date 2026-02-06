import React from 'react';

function rimGet(v, ...keys) {
  for (const k of keys) {
    if (v[k] !== undefined) return v[k];
  }
  return undefined;
}

const FIXED_RIM_STYLES = ['Stock', 'Sport', 'Multi-Piece', 'Specialised',];

const STOCK_SENTINEL = '__STOCK__';

function stripStock(options) {
  if (!options || !options.length) return [];
  return options.filter((o) => o && o !== 'Stock');
}

function normalizeToFixedStyle(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('stock')) return 'Stock';
  if (s.includes('sport')) return 'Sport';
  if (s.includes('multi') || s.includes('split') || s.includes('piece')) return 'Multi-Piece';
  if (s.includes('special') || s.includes('specialis') || s.includes('specializ')) return 'Specialised';
  for (const fs of FIXED_RIM_STYLES) {
    if (s === fs.toLowerCase()) return fs;
  }
  return 'Stock';
}

export default function PartGroup({ section, parts, selectedValues, allSelectedValues, onSelect, rims }) {
  const renderControl = (part, partData) => {
    const value = selectedValues[part] || '';

    // Engine Aspiration options depend on Conversion -> Aspiration (type)
    if (section === 'Engine' && part === 'Aspiration') {
      const conversionType = allSelectedValues?.Conversion?.Aspiration || 'Stock';
      let allowed = ['Stock'];
      if (conversionType === 'Turbo' || conversionType === 'Twin Turbo') {
        allowed = ['Stock', 'Street', 'Sport', 'Race', 'Race with Anti-lag'];
      } else if (conversionType === 'Supercharger' || conversionType === 'Centrifugal Supercharger') {
        allowed = ['Stock', 'Race'];
      }

      const effectiveValue = value === '' || value === 'Stock' ? STOCK_SENTINEL : value;
      const nonStock = allowed.filter((o) => o && o !== 'Stock');

      return (
        <select
          value={effectiveValue}
          onChange={(e) => onSelect(section, part, e.target.value === STOCK_SENTINEL ? 'Stock' : e.target.value)}
          className="part-select"
        >
          <option value={STOCK_SENTINEL}>Stock</option>
          {nonStock.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // four-dropdown rim UI
    if (section === 'Rims') {
      const rimsByStyle = {
        'Stock': [],
        'Sport': [],
        'Multi-Piece': [],
        'Specialised': [],
      };

      if (rims && rims.length) {
        for (const r of rims) {
          const rawStyle = rimGet(r, 'Style', 'style') ?? '';
          const normalized = normalizeToFixedStyle(rawStyle);
          if (normalized) rimsByStyle[normalized].push(r);
        }
      }

      const manufacturerKey = `${part}-Manufacturer`;
      const nameKey = `${part}-Name`;
      const sizeKey = `${part}-Size`;
      const combinedKey = `${part}-Rim`;

      const currentManufacturer = selectedValues[manufacturerKey] || '';
      const currentName = selectedValues[nameKey] || '';
      const currentSize = selectedValues[sizeKey] || '';

      // manufacturers for current style
      const manufacturersForStyle = (value && rimsByStyle[value]
        ? Array.from(new Set(rimsByStyle[value].map(r => String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim())))
        : []).sort((a, b) => a.localeCompare(b));

      // names for style+manufacturer
      const namesForStyleManufacturer = (value && currentManufacturer && rimsByStyle[value]
        ? Array.from(new Set(rimsByStyle[value]
            .filter(r => String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim().toLowerCase() === currentManufacturer.toLowerCase())
            .map(r => String(rimGet(r, 'Name', 'name') ?? '').trim())
          ))
        : []).sort((a, b) => a.localeCompare(b));

      // sizes for style+manufacturer+name
      const sizesForSelection = (value && currentManufacturer && currentName && rimsByStyle[value]
        ? Array.from(new Set(rimsByStyle[value]
            .filter(r => String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim().toLowerCase() === currentManufacturer.toLowerCase()
              && String(rimGet(r, 'Name', 'name') ?? '').trim() === currentName)
            .map(r => String(rimGet(r, 'Size', 'size') ?? '').trim())
          ))
        : []).sort((a, b) => a.localeCompare(b));

      const updateCombined = (man, nm, sz) => {
        if (man && nm && sz) {
          onSelect(section, combinedKey, `${man}|||${nm}|||${sz}`);
        } else {
          onSelect(section, combinedKey, '');
        }
      };

      return (
        <div className="rim-4-group">
          {/* Style */}
          <select
            value={!value || value === 'Stock' ? STOCK_SENTINEL : value}
            onChange={(e) => {
              const newStyle = e.target.value;
              if (newStyle === STOCK_SENTINEL) {
                onSelect(section, part, 'Stock');
                onSelect(section, manufacturerKey, '');
                onSelect(section, nameKey, '');
                onSelect(section, sizeKey, '');
                onSelect(section, combinedKey, '');
                return;
              }

              onSelect(section, part, newStyle);
              onSelect(section, manufacturerKey, '');
              onSelect(section, nameKey, '');
              onSelect(section, sizeKey, '');
              onSelect(section, combinedKey, '');
            }}
          >
            <option value={STOCK_SENTINEL}>Stock</option>
            <option value="">Select Style</option>
            {FIXED_RIM_STYLES.filter((s) => s !== 'Stock').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {!value || value === 'Stock' ? null : (
            <>
              {/* Manufacturer */}
              <select
                value={currentManufacturer}
                onChange={(e) => {
                  const m = e.target.value;
                  if (m === STOCK_SENTINEL) {
                    onSelect(section, part, 'Stock');
                    onSelect(section, manufacturerKey, '');
                    onSelect(section, nameKey, '');
                    onSelect(section, sizeKey, '');
                    onSelect(section, combinedKey, '');
                    return;
                  }
                  onSelect(section, manufacturerKey, m);
                  onSelect(section, nameKey, '');
                  onSelect(section, sizeKey, '');
                  onSelect(section, combinedKey, '');
                }}
                disabled={!value}
                style={{ marginTop: 8 }}
              >
                <option value={STOCK_SENTINEL}>Stock</option>
                <option value="">{value ? 'Select manufacturer...' : 'Select a style first'}</option>
                {manufacturersForStyle.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Name */}
              {!currentManufacturer ? null : (
                <select
                  value={currentName}
                  onChange={(e) => {
                    const nm = e.target.value;
                    if (nm === STOCK_SENTINEL) {
                      onSelect(section, part, 'Stock');
                      onSelect(section, manufacturerKey, '');
                      onSelect(section, nameKey, '');
                      onSelect(section, sizeKey, '');
                      onSelect(section, combinedKey, '');
                      return;
                    }
                    onSelect(section, nameKey, nm);
                    onSelect(section, sizeKey, '');
                    onSelect(section, combinedKey, '');
                  }}
                  style={{ marginTop: 8 }}
                >
                  <option value={STOCK_SENTINEL}>Stock</option>
                  <option value="">Select rim model...</option>
                  {namesForStyleManufacturer.map((nm) => (
                    <option key={nm} value={nm}>
                      {nm}
                    </option>
                  ))}
                </select>
              )}

              {/* Size */}
              {!currentManufacturer || !currentName ? null : (
                <select
                  value={currentSize}
                  onChange={(e) => {
                    const sz = e.target.value;
                    if (sz === STOCK_SENTINEL) {
                      onSelect(section, part, 'Stock');
                      onSelect(section, manufacturerKey, '');
                      onSelect(section, nameKey, '');
                      onSelect(section, sizeKey, '');
                      onSelect(section, combinedKey, '');
                      return;
                    }
                    onSelect(section, sizeKey, sz);
                    const man = selectedValues[manufacturerKey] || '';
                    const nm = selectedValues[nameKey] || '';
                    updateCombined(man, nm, sz);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <option value={STOCK_SENTINEL}>Stock</option>
                  <option value="">Select rim size...</option>
                  {sizesForSelection.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>
      );
    }

    // non-rim controls (unchanged)
    if (partData.control === 'button' || partData.control === 'dropdown') {
      const v = selectedValues[part] || '';
      const effectiveValue = v === '' || v === 'Stock' ? STOCK_SENTINEL : v;
      const options = stripStock(partData.options);
      return (
        <select
          value={effectiveValue}
          onChange={(e) => onSelect(section, part, e.target.value === STOCK_SENTINEL ? 'Stock' : e.target.value)}
          className="part-select"
        >
          <option value={STOCK_SENTINEL}>Stock</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (partData.control === 'text') {
      const v = selectedValues[part] || '';
      return (
        <input
          type="text"
          value={v}
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
