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
  // tolerate lowercase keys too
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

function rimGet(v: RimEntry, ...keys: string[]) {
  for (const k of keys) {
    if ((v as any)[k] !== undefined) return (v as any)[k];
  }
  return undefined;
}

function rimLabel(rim: RimEntry) {
  const manufacturer = String(rimGet(rim, 'Manufacturer', 'manufacturer') ?? '').trim();
  const name = String(rimGet(rim, 'Name', 'name') ?? '').trim();
  const size = rimGet(rim, 'Size', 'size');
  const price = rimGet(rim, 'Price', 'price');
  const sizeStr = size ? ` (${size})` : '';
  const priceStr = price ? ` - $${price}` : '';
  return `${manufacturer} ${name}${sizeStr}${priceStr}`.trim();
}

export default function PartsForm({ schema, values, onValueChange, rims }: PartsFormProps) {
  const renderControl = (section: string, partName: string, partConfig: PartOption) => {
    const currentValue = values[section]?.[partName] || '';

    // Helper to render rim selects (style -> wheel)
    const renderRimsSelector = () => {
      // build unique styles from rims list
      const styles: string[] = [];
      if (rims && rims.length) {
        const seen = new Set<string>();
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

      // currently selected wheel (separate stored key)
      const wheelKey = `${partName}-Rim`;
      const selectedWheel = values[section]?.[wheelKey] || '';

      return (
        <div className="dropdown-group">
          <select
            value={currentValue}
            onChange={(e) => {
              const newStyle = e.target.value;
              // update style for the part
              onValueChange(section, partName, newStyle);
              // clear previously selected wheel for this part when style changes
              onValueChange(section, wheelKey, '');
            }}
            className="style-select"
          >
            <option value="">Select rim style</option>
            {styles.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* wheel list for selected style */}
          <select
            value={selectedWheel}
            onChange={(e) => onValueChange(section, wheelKey, e.target.value)}
            className="rim-select"
            disabled={!currentValue}
            style={{ marginTop: 8 }}
          >
            <option value="">{currentValue ? 'Select rim...' : 'Select a style first'}</option>
            {rims
              ?.filter((r) => {
                const style = String(rimGet(r, 'Style', 'style') ?? '').trim();
                return style && currentValue && style.toLowerCase() === currentValue.toLowerCase();
              })
              .map((r, idx) => (
                <option key={idx} value={`${String(rimGet(r, 'Manufacturer', 'manufacturer') ?? '')}|||${String(rimGet(r, 'Name', 'name') ?? '')}`}>
                  {rimLabel(r)}
                </option>
              ))}
          </select>
        </div>
      );
    };

    switch (partConfig.control) {
      case 'button':
        // convert former button groups into dropdowns (except rim special handled below)
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
          // treat 'dropdown' in Rims the same as above
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
