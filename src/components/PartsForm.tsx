import React from 'react';

interface PartOption {
  control: 'button' | 'dropdown' | 'text';
  options?: string[];
  default?: string;
  hint?: string;
}

interface PartsSchema {
  sections: {
    [sectionName: string]: {
      parts: {
        [partName: string]: PartOption;
      };
    };
  };
}

interface RimEntry {
  Manufacturer?: string;
  Name?: string;
  Style?: string;
  Size?: string | number;
  Price?: string | number;
  manufacturer?: string;
  name?: string;
  style?: string;
  size?: string | number;
  price?: string | number;
}

interface PartsFormProps {
  schema: PartsSchema;
  values: { [section: string]: { [part: string]: string } };
  onValueChange: (section: string, part: string, value: string) => void;
  rims?: RimEntry[]; // loaded from data/fh5_rims.json
}

// fixed styles
const FIXED_RIM_STYLES = ['Sport', 'Multi-Piece', 'Specialised', 'Stock'] as const;
type FixedStyle = typeof FIXED_RIM_STYLES[number];

function rimGet(v: RimEntry, ...keys: string[]) {
  for (const k of keys) {
    if ((v as any)[k] !== undefined) return (v as any)[k];
  }
  return undefined;
}

function normalizeToFixedStyle(raw?: string | null): FixedStyle | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('sport')) return 'Sport';
  if (s.includes('multi') || s.includes('split') || s.includes('piece')) return 'Multi-Piece';
  if (s.includes('special') || s.includes('specialis') || s.includes('specializ')) return 'Specialised';
  if (s.includes('stock')) return 'Stock';
  for (const fs of FIXED_RIM_STYLES) {
    if (s === fs.toLowerCase()) return fs;
  }
  return 'Stock';
}

function dedupeSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

const STOCK_SENTINEL = '__STOCK__';

function stripStock(options?: string[]) {
  if (!options || !options.length) return [] as string[];
  return options.filter((o) => o && o !== 'Stock');
}

export default function PartsForm({ schema, values, onValueChange, rims }: PartsFormProps) {
  const ORDERED_SECTION_GROUPS: Array<{ key: string; title: string; sections: string[]; partOrder: string[] }> = [
    {
      key: 'conversion',
      title: 'Conversion',
      sections: ['Conversion'],
      // Engine Swap intentionally omitted for now
      partOrder: ['Drivetrain Swap', 'Aspiration'],
    },
    {
      key: 'aero',
      title: 'Aero and Appearance',
      sections: ['Aero'],
      partOrder: ['Front Bumper', 'Side Skirts', 'Rear Bumper', 'Rear Wing'],
    },
    {
      key: 'tyres-rims',
      title: 'Tyres and Rims',
      sections: ['Tires', 'Rims'],
      partOrder: [
        // closest equivalents to your list using existing schema names
        'Front Compound',
        'Rear Compound',
        'Front Track Width',
        'Rear Track Width',
        'Front Rims Style',
        'Rear Rims Style',
      ],
    },
    {
      key: 'drivetrain',
      title: 'Drivetrain',
      sections: ['Drivetrain'],
      partOrder: ['Clutch', 'Transmission', 'Driveline', 'Differential'],
    },
    {
      key: 'platform',
      title: 'Platform and Handling',
      sections: ['Platform'],
      partOrder: ['Brakes', 'Springs', 'Front ARB', 'Rear ARB', 'Chassis Reinforcement', 'Weight Reduction'],
    },
    {
      key: 'engine',
      title: 'Engine',
      // NOTE: Aspiration is defined under Conversion in the schema,
      // but the UI should present it under Engine.
      sections: ['Engine', 'Conversion'],
      partOrder: [
        'Aspiration',
        'Intake',
        'Fuel System',
        'Ignition',
        'Exhaust',
        'Camshaft',
        'Valves',
        'Displacement',
        'Pistons',
        'Intercooler',
        'Oil Cooling',
        'Flywheel',
      ],
    },
  ];

  function orderParts(partEntries: Array<[string, PartOption]>, partOrder: string[]) {
    const orderIndex = new Map<string, number>();
    partOrder.forEach((p, i) => orderIndex.set(p, i));
    return [...partEntries].sort(([a], [b]) => {
      const ai = orderIndex.has(a) ? orderIndex.get(a)! : Number.MAX_SAFE_INTEGER;
      const bi = orderIndex.has(b) ? orderIndex.get(b)! : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }

  const renderControl = (section: string, partName: string, partConfig: PartOption) => {
    const currentStyle = values[section]?.[partName] || '';
    const manufacturerKey = `${partName}-Manufacturer`;
    const nameKey = `${partName}-Name`;
    const sizeKey = `${partName}-Size`;
    const combinedKey = `${partName}-Rim`; // keep for compatibility

    const currentManufacturer = values[section]?.[manufacturerKey] || '';
    const currentName = values[section]?.[nameKey] || '';
    const currentSize = values[section]?.[sizeKey] || '';

    // build rims grouped or derived lists
    const rimsList = rims || [];

    // manufacturers for a style
    const manufacturersForStyle = React.useMemo(() => {
      if (!currentStyle || currentStyle === 'Stock') return [] as string[];
      const ms: string[] = rimsList
        .filter((r) => {
          const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
          const norm = normalizeToFixedStyle(style);
          return norm && norm === currentStyle;
        })
        .map((r) => String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim());
      return dedupeSorted(ms);
    }, [rimsList, currentStyle]);

    // names for style + manufacturer
    const namesForStyleManufacturer = React.useMemo(() => {
      if (!currentStyle || currentStyle === 'Stock' || !currentManufacturer) return [] as string[];
      const ns: string[] = rimsList
        .filter((r) => {
          const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
          const norm = normalizeToFixedStyle(style);
          const man = String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim();
          return norm === currentStyle && man.toLowerCase() === currentManufacturer.toLowerCase();
        })
        .map((r) => String(rimGet(r, 'Name', 'name') ?? '').trim());
      return dedupeSorted(ns);
    }, [rimsList, currentStyle, currentManufacturer]);

    // sizes for style+manufacturer+name
    const sizesForSelection = React.useMemo(() => {
      if (!currentStyle || currentStyle === 'Stock' || !currentManufacturer || !currentName) return [] as string[];
      const ss: string[] = rimsList
        .filter((r) => {
          const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
          const norm = normalizeToFixedStyle(style);
          const man = String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim();
          const name = String(rimGet(r, 'Name', 'name') ?? '').trim();
          return norm === currentStyle && man.toLowerCase() === currentManufacturer.toLowerCase() && name === currentName;
        })
        .map((r) => String(rimGet(r, 'Size', 'size') ?? '').trim());
      return dedupeSorted(ss);
    }, [rimsList, currentStyle, currentManufacturer, currentName]);

    // helper to update combined value for backwards compatibility
    const updateCombined = (man: string, nm: string, sz: string) => {
      if (man && nm && sz) {
        onValueChange(section, combinedKey, `${man}|||${nm}|||${sz}`);
      } else {
        onValueChange(section, combinedKey, '');
      }
    };

    // Render the 4-select rim UI for Rims section
    const renderRimFourDropdowns = () => {
      const isStock = !currentStyle || currentStyle === 'Stock';
      const effectiveStyleValue = isStock ? STOCK_SENTINEL : currentStyle;

      return (
        <div className="rim-4-group">
          {/* Dropdown 1: Style */}
          <select
            value={effectiveStyleValue}
            onChange={(e) => {
              const s = e.target.value;
              if (s === STOCK_SENTINEL) {
                onValueChange(section, partName, 'Stock');
                onValueChange(section, manufacturerKey, '');
                onValueChange(section, nameKey, '');
                onValueChange(section, sizeKey, '');
                onValueChange(section, combinedKey, '');
                return;
              }

              onValueChange(section, partName, s);
              // clear downstream
              onValueChange(section, manufacturerKey, '');
              onValueChange(section, nameKey, '');
              onValueChange(section, sizeKey, '');
              onValueChange(section, combinedKey, '');
            }}
            className="style-select"
          >
            <option value={STOCK_SENTINEL}>Stock</option>
            {FIXED_RIM_STYLES.filter((s) => s !== 'Stock').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {isStock ? null : (
            <>
              {/* Dropdown 2: Manufacturer (filtered by style) */}
              <select
                value={currentManufacturer === 'Stock' ? STOCK_SENTINEL : currentManufacturer}
                onChange={(e) => {
                  const m = e.target.value;
                  if (m === STOCK_SENTINEL) {
                    onValueChange(section, partName, 'Stock');
                    onValueChange(section, manufacturerKey, '');
                    onValueChange(section, nameKey, '');
                    onValueChange(section, sizeKey, '');
                    onValueChange(section, combinedKey, '');
                    return;
                  }
                  onValueChange(section, manufacturerKey, m);
                  // clear downstream
                  onValueChange(section, nameKey, '');
                  onValueChange(section, sizeKey, '');
                  onValueChange(section, combinedKey, '');
                }}
                disabled={!currentStyle || currentStyle === 'Stock'}
                style={{ marginTop: 8 }}
              >
                <option value={STOCK_SENTINEL}>Stock</option>
                <option value="">{currentStyle ? 'Select manufacturer...' : 'Select a style first'}</option>
                {manufacturersForStyle.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Dropdown 3: Rim Name (filtered by style+manufacturer) */}
              {!currentManufacturer ? null : (
                <select
                  value={currentName === 'Stock' ? STOCK_SENTINEL : currentName}
                  onChange={(e) => {
                    const nm = e.target.value;
                    if (nm === STOCK_SENTINEL) {
                      onValueChange(section, partName, 'Stock');
                      onValueChange(section, manufacturerKey, '');
                      onValueChange(section, nameKey, '');
                      onValueChange(section, sizeKey, '');
                      onValueChange(section, combinedKey, '');
                      return;
                    }
                    onValueChange(section, nameKey, nm);
                    // clear size and combined
                    onValueChange(section, sizeKey, '');
                    onValueChange(section, combinedKey, '');
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

              {/* Dropdown 4: Rim Size (filtered by style+manufacturer+name) */}
              {!currentManufacturer || !currentName ? null : (
                <select
                  value={currentSize === 'Stock' ? STOCK_SENTINEL : currentSize}
                  onChange={(e) => {
                    const sz = e.target.value;
                    if (sz === STOCK_SENTINEL) {
                      onValueChange(section, partName, 'Stock');
                      onValueChange(section, manufacturerKey, '');
                      onValueChange(section, nameKey, '');
                      onValueChange(section, sizeKey, '');
                      onValueChange(section, combinedKey, '');
                      return;
                    }
                    onValueChange(section, sizeKey, sz);
                    // update combined as manufacturer|||name|||size
                    const man = values[section]?.[manufacturerKey] || '';
                    const nm = values[section]?.[nameKey] || '';
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
    };

    // Switch by control type
    switch (partConfig.control) {
      case 'button':
      case 'dropdown':
        // only Rims section gets the 4-dropdown UI
        if (section === 'Rims' && rims && rims.length) {
          return renderRimFourDropdowns();
        }
        // otherwise render a single select
        const rawValue = values[section]?.[partName] || '';
        const effectiveValue = rawValue === '' || rawValue === 'Stock' ? STOCK_SENTINEL : rawValue;
        const options = stripStock(partConfig.options);
        return (
          <select
            value={effectiveValue}
            onChange={(e) => {
              const v = e.target.value;
              onValueChange(section, partName, v === STOCK_SENTINEL ? 'Stock' : v);
            }}
            className="part-select"
          >
            <option value={STOCK_SENTINEL}>Stock</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'text':
        return (
          <input
            type="text"
            value={values[section]?.[partName] || ''}
            onChange={(e) => onValueChange(section, partName, e.target.value)}
            placeholder={partConfig.default || partConfig.hint || ''}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="parts-form">
      {ORDERED_SECTION_GROUPS.map((group) => {
        // gather all parts from the sections in this group
        const parts: Array<[string, PartOption, string]> = [];
        for (const sec of group.sections) {
          const secData = schema.sections?.[sec];
          if (!secData) continue;
          for (const [partName, partConfig] of Object.entries(secData.parts)) {
            // explicitly omit Engine Swap until data exists
            if (sec === 'Conversion' && partName === 'Engine Swap') continue;

             // UI grouping rules:
             // - Show Aspiration under Engine (but it lives in Conversion in the schema)
             if (group.key === 'engine' && sec === 'Conversion' && partName !== 'Aspiration') continue;

            parts.push([partName, partConfig, sec]);
          }
        }

        if (!parts.length) return null;

        // Order within group
        const ordered = orderParts(
          parts.map(([p, cfg]) => [p, cfg] as [string, PartOption]),
          group.partOrder,
        );

        // Re-associate ordered part configs with their original section
        const partToSection = new Map<string, string>();
        const partToConfig = new Map<string, PartOption>();
        for (const [p, cfg, sec] of parts) {
          partToSection.set(p, sec);
          partToConfig.set(p, cfg);
        }

        return (
          <div key={group.key} className="part-section">
            <h3>{group.title}</h3>
            <div className="part-grid">
              {ordered.map(([partName]) => {
                const partConfig = partToConfig.get(partName);
                const sectionName = partToSection.get(partName);
                if (!partConfig || !sectionName) return null;
                return (
                  <div key={`${sectionName}::${partName}`} className="part-control">
                    <label>{partName}</label>
                    {renderControl(sectionName, partName, partConfig)}
                    {partConfig.hint && <span className="hint">{partConfig.hint}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Render any remaining sections (e.g., Tuning) after ordered upgrade groups */}
      {Object.entries(schema.sections)
        .filter(([sectionName]) => !ORDERED_SECTION_GROUPS.some((g) => g.sections.includes(sectionName)))
        .map(([sectionName, sectionData]) => (
          <div key={sectionName} className="part-section">
            <h3>{sectionName}</h3>
            <div className="part-grid">
              {Object.entries(sectionData.parts).map(([partName, partConfig]) => (
                <div key={partName} className="part-control">
                  <label>{partName}</label>
                  {renderControl(sectionName, partName, partConfig)}
                  {partConfig.hint && <span className="hint">{partConfig.hint}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
