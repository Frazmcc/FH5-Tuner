import React from 'react';

export default function PartGroup({ section, parts, selectedValues, onSelect, rims }) {
  const renderControl = (part, partData) => {
    const value = selectedValues[part] || '';
    const key = `${section}-${part}`;
    
    if (partData.control === 'button') {
      return (
        <div className="options-group">
          {partData.options.map(option => (
            <button
              key={option}
              className={`option-btn ${value === option ? 'selected' : ''}`}
              onClick={() => onSelect(section, part, option)}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }
    
    if (partData.control === 'dropdown') {
      // For rim styles, show style selector
      if (part.includes('Rims Style')) {
        return (
          <div className="dropdown-group">
            <select
              value={value}
              onChange={(e) => onSelect(section, part, e.target.value)}
              className="style-select"
            >
              <option value="">Select Style</option>
              {partData.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {value && value !== 'Stock' && rims && (
              <select
                value={selectedValues[`${part}-Rim`] || ''}
                onChange={(e) => onSelect(section, `${part}-Rim`, e.target.value)}
                className="rim-select"
              >
                <option value="">Select Rim</option>
                {rims
                  .filter(rim => rim.style === value)
                  .map((rim, idx) => (
                    <option key={idx} value={rim.name}>
                      {rim.manufacturer} {rim.name} ({rim.size}") - ${rim.price}
                    </option>
                  ))}
              </select>
            )}
          </div>
        );
      }
      
      return (
        <select
          value={value}
          onChange={(e) => onSelect(section, part, e.target.value)}
          className="part-select"
        >
          <option value="">Select Option</option>
          {partData.options.map(option => (
            <option key={option} value={option}>{option}</option>
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
