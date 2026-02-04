import React, { useState, useMemo } from 'react';
import type { Car } from '../tuner/engine';

interface CarPickerProps {
  cars: Car[];
  selectedCar: Car | null;
  onSelectCar: (car: Car) => void;
}

export default function CarPicker({ cars, selectedCar, onSelectCar }: CarPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter cars based on search term
  const filteredCars = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return cars;
    
    return cars.filter(car => {
      const manufacturer = car.manufacturer.toLowerCase();
      const model = car.model.toLowerCase();
      const year = car.year.toString();
      const drivetrain = car.drivetrain.toLowerCase();
      
      return (
        manufacturer.includes(term) ||
        model.includes(term) ||
        year.includes(term) ||
        drivetrain.includes(term) ||
        `${manufacturer} ${model}`.includes(term)
      );
    });
  }, [cars, searchTerm]);

  const handleSelect = (car: Car) => {
    onSelectCar(car);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="car-picker">
      <label>Select Car:</label>
      
      <div className="car-picker-input" onClick={() => setIsOpen(true)}>
        {selectedCar ? (
          <div className="selected-car">
            <strong>{selectedCar.year} {selectedCar.manufacturer} {selectedCar.model}</strong>
            <div className="car-details">
              PI {selectedCar.pi} | {selectedCar.drivetrain} | {selectedCar.power_hp}hp @ {selectedCar.weight_lbs}lbs
            </div>
          </div>
        ) : (
          <span className="placeholder">Click to select a car...</span>
        )}
      </div>

      {isOpen && (
        <div className="car-picker-dropdown">
          <div className="car-picker-search">
            <input
              type="text"
              placeholder="Search by manufacturer, model, year, or drivetrain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
          </div>

          <div className="car-list">
            {filteredCars.length === 0 ? (
              <div className="no-results">No cars found matching "{searchTerm}"</div>
            ) : (
              filteredCars.map((car, index) => (
                <div
                  key={`${car.manufacturer}-${car.model}-${car.year}-${index}`}
                  className="car-list-item"
                  onClick={() => handleSelect(car)}
                >
                  <div className="car-name">
                    {car.year} {car.manufacturer} {car.model}
                  </div>
                  <div className="car-specs">
                    <span className="pi">PI {car.pi}</span>
                    <span className="drivetrain">{car.drivetrain}</span>
                    <span className="power">{car.power_hp}hp</span>
                    <span className="weight">{car.weight_lbs}lbs</span>
                  </div>
                  <div className="car-meta">
                    {car.engine_type} {car.aspiration !== 'Naturally Aspirated' ? car.aspiration : 'NA'} • {car.displacement_l}L
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
