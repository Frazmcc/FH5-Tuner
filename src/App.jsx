import React, { useState } from 'react';
import PartGroup from './components/PartGroup';
import TuneOutput from './components/TuneOutput';
import { calculateTune } from './utils/tuner';
import forzaSchema from '../data/forza_schema.json';
import fh5Rims from '../data/fh5_rims.json';
import './styles.css';

function App() {
  const [formData, setFormData] = useState({});
  const [tuneType, setTuneType] = useState('Road');
  const [weather, setWeather] = useState('Dry');
  
  const handlePartSelect = (section, part, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [part]: value
      }
    }));
  };
  
  const tune = calculateTune(formData, tuneType, weather);
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>FH5 Tuner</h1>
        <p>Build your car and get optimized tune settings</p>
      </header>
      
      <div className="controls">
        <div className="control-group">
          <label>Tune Type:</label>
          <select value={tuneType} onChange={(e) => setTuneType(e.target.value)} className="tune-select">
            <option value="Road">Road</option>
            <option value="Race">Race</option>
            <option value="Drift">Drift</option>
            <option value="Offroad">Offroad</option>
            <option value="Rally">Rally</option>
            <option value="Cruise">Cruise</option>
            <option value="Drag">Drag</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Weather:</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)} className="weather-select">
            <option value="Dry">Dry</option>
            <option value="Wet">Wet</option>
          </select>
        </div>
      </div>
      
      <div className="main-content">
        <div className="parts-panel">
          <h2>Build Your Car</h2>
          {Object.entries(forzaSchema.sections).map(([section, { parts }]) => (
            <PartGroup
              key={section}
              section={section}
              parts={parts}
              selectedValues={formData[section] || {}}
              onSelect={handlePartSelect}
              rims={fh5Rims}
            />
          ))}
        </div>
        
        <div className="tune-panel">
          <TuneOutput tune={tune} />
        </div>
      </div>
    </div>
  );
}

export default App;
