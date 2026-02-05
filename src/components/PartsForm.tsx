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
  rims?: RimEntry[];
}

const FIXED_RIM_STYLES = ['Sport', 'Multi-Piece', 'Specialised', 'Stock'] as const;
type FixedStyle = typeof FIXED_RIM_STYLES[number];

function rimGet(v: RimEntry, ...keys: string[]) {
  for (const k of keys) {
    if ((v as any)[k] !== undefined) return (v as any)[k];
  }
  return undefined;
}

function rimModel(rim: RimEntry) {
  // The "model" is the Name field
  return String(rimGet(rim, 'Name', 'name') ?? '').trim();
}

function normalizeToFixedStyle(raw?: string | null): FixedStyle | null {
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

export default function PartsForm({ schema, values, onValueChange, rims }: PartsFormProps) {
  const renderControl = (section: string, partName: string, partConfig: PartOption) => {
    const currentValue = values[section]?.[partName] || '';

    const renderRimsSelector = () => {
      const rimsByStyle: Record<FixedStyle, RimEntry[]> = {
        'Sport': [],
        'Multi-Piece': [],
        'Specialised': [],
        'Stock': [],
      };

      if (rims && rims.length) {
        for (const r of rims) {
          const rawStyle = rimGet(r, 'Style', 'style') ?? '';
          const normalized = normalizeToFixedStyle(String(rawStyle));
          if (normalized) rimsByStyle[normalized].push(r);
        }
      }

      const wheelKey = `${partName}-Rim`;
      const selectedWheel = values[section]?.[wheelKey] || '';

      return (
        <div className="dropdown-group">
          <select
            value={currentValue}
            onChange={(e) => {
              const newStyle = e.target.value;
              onValueChange(section, partName, newStyle);
              onValueChange(section, wheelKey, '');
            }}
            className="style-select"
          >
            <option value="">Select rim style</option>
            {FIXED_RIM_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedWheel}
            onChange={(e) => onValueChange(section, wheelKey, e.target.value)}
            className="rim-select"
            disabled={!currentValue}
            style={{ marginTop: 8 }}
          >
            <option value="">{currentValue ? 'Select rim model...' : 'Select a style first'}</option>

            {currentValue &&
              (rimsByStyle[currentValue as FixedStyle] || []).map((r, idx) => {
                const model = rimModel(r);
                const manufacturer = String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '').trim();
                // keep value encoding manufacturer|||model for later parsing if needed
                const val = `${manufacturer}|||${model}`;
                return (
                  <option key={idx} value={val}>
                    {model}
                  </option>
                );
              })}
          </select>
        </div>
      );
    };

    switch (partConfig.control) {
      case 'button':
        if (section === 'Rims' && rims) {
          return renderRimsSelector();
        }
        return (
          <select
            value={currentValue}
            onChange={(e) => onValueChange(section, partName, e.target.value)}
            className="part-select"
          >
            <option value="">Select...</option>
            {partConfig.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'dropdown':
        if (section === 'Rims' && rims) {
          return renderRimsSelector();
        }
        return (
          <select value={currentValue} onChange={(e) => onValueChange(section, partName, e.target.value)}>
            <option value="">Select...</option>
            {partConfig.options?.map((option) => (
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
            value={currentValue}
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
      {Object.entries(schema.sections).map(([sectionName, sectionData]) => (
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
