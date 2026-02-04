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

interface PartsFormProps {
  schema: PartsSchema;
  values: { [section: string]: { [part: string]: string } };
  onValueChange: (section: string, part: string, value: string) => void;
  rims?: Array<{ Name: string; Manufacturer: string; Style: string }>;
}

export default function PartsForm({ schema, values, onValueChange, rims }: PartsFormProps) {
  const renderControl = (section: string, partName: string, partConfig: PartOption) => {
    const currentValue = values[section]?.[partName] || '';

    switch (partConfig.control) {
      case 'button':
        return (
          <div className="button-group">
            {partConfig.options?.map((option) => (
              <button
                key={option}
                className={currentValue === option ? 'active' : ''}
                onClick={() => onValueChange(section, partName, option)}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'dropdown':
        // Special handling for rim dropdowns
        if (section === 'Rims' && rims) {
          return (
            <select
              value={currentValue}
              onChange={(e) => onValueChange(section, partName, e.target.value)}
            >
              <option value="">Select rim...</option>
              {partConfig.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <optgroup label="Available Rims">
                {rims.map((rim, idx) => (
                  <option key={idx} value={`${rim.Manufacturer} ${rim.Name}`}>
                    {rim.Manufacturer} {rim.Name} ({rim.Style})
                  </option>
                ))}
              </optgroup>
            </select>
          );
        }

        return (
          <select
            value={currentValue}
            onChange={(e) => onValueChange(section, partName, e.target.value)}
          >
            <option value="">Select...</option>
            {partConfig.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
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
