import React, { useState } from 'react';
import CarPicker from '../components/CarPicker';
import PartsForm from '../components/PartsForm';
import { calculateTune, formatTuneForFH5, type Car, type TuneType, type WeatherPreset } from '../tuner/engine';

import partsSchema from '../../data/schema/forza_parts.json';
import rimsData from '../../data/fh5_rims.json';

export default function Calculator() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [tuneType, setTuneType] = useState<TuneType>('Race');
  const [weather, setWeather] = useState<WeatherPreset>('Dry');
  const [partValues, setPartValues] = useState<{ [section: string]: { [part: string]: string } }>({});
  const [tuneOutput, setTuneOutput] = useState<{ json: string; text: string } | null>(null);

  const handlePartChange = (section: string, part: string, value: string) => {
    setPartValues(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [part]: value
      }
    }));
  };

  const handleCalculate = () => {
    if (!selectedCar) {
      alert('Please select a car first!');
      return;
    }

    const tune = calculateTune(selectedCar, partValues, tuneType, weather);
    const formatted = formatTuneForFH5(tune, selectedCar, tuneType);

    setTuneOutput({
      json: JSON.stringify(tune, null, 2),
      text: formatted
    });
  };

  const handleDownloadJSON = () => {
    if (!tuneOutput) return;

    const blob = new Blob([tuneOutput.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fh5-tune-${selectedCar?.manufacturer}-${selectedCar?.model}-${tuneType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    if (!tuneOutput) return;

    try {
      await navigator.clipboard.writeText(tuneOutput.text);
      alert('Tune copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy tune');
    }
  };

  return (
    <div className="calculator-page">
      <header className="calculator-header">
        <h1>FH5 Tuner Calculator</h1>
        <p>Build your car, select tune type, and generate optimized settings</p>
      </header>

      <div className="calculator-content">
        {/* Left Panel - Car Selection & Tune Settings */}
        <div className="left-panel">
          <div className="config-section">
            <CarPicker
              onSelect={setSelectedCar}
            />
          </div>

          <div className="config-section">
            <label>Tune Type:</label>
            <select
              value={tuneType}
              onChange={(e) => setTuneType(e.target.value as TuneType)}
              className="tune-select"
            >
              <option value="Street">Street</option>
              <option value="Road">Road</option>
              <option value="Race">Race</option>
              <option value="Drift">Drift</option>
              <option value="Rally">Rally</option>
              <option value="Offroad">Offroad</option>
              <option value="Cruise">Cruise</option>
              <option value="Drag">Drag</option>
            </select>
          </div>

          <div className="config-section">
            <label>Weather Preset:</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as WeatherPreset)}
              className="weather-select"
            >
              <option value="Dry">Dry</option>
              <option value="Wet">Wet</option>
            </select>
          </div>

          <div className="config-section">
            <button
              onClick={handleCalculate}
              className="calculate-btn"
              disabled={!selectedCar}
            >
              Calculate Tune
            </button>
          </div>

          {/* Parts Selection */}
          <div className="parts-section">
            <h2>Upgrades & Parts</h2>
            <PartsForm
              schema={partsSchema}
              values={partValues}
              onValueChange={handlePartChange}
              rims={rimsData}
            />
          </div>
        </div>

        {/* Right Panel - Tune Output */}
        <div className="right-panel">
          <h2>Tune Output</h2>
          
          {tuneOutput ? (
            <div className="tune-output">
              <div className="output-section">
                <div className="output-header">
                  <h3>Plain Text (Copy to FH5)</h3>
                  <button onClick={handleCopyText} className="copy-btn">
                    📋 Copy to Clipboard
                  </button>
                </div>
                <pre className="tune-text">{tuneOutput.text}</pre>
              </div>

              <div className="output-section">
                <div className="output-header">
                  <h3>JSON Data</h3>
                  <button onClick={handleDownloadJSON} className="download-btn">
                    💾 Download JSON
                  </button>
                </div>
                <pre className="tune-json">{tuneOutput.json}</pre>
              </div>
            </div>
          ) : (
            <div className="no-output">
              <p>Select a car and click "Calculate Tune" to generate settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
