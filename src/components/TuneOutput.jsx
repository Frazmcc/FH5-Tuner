import React from 'react';

export default function TuneOutput({ tune }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(tune, null, 2))
      .then(() => alert('Tune copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };
  
  return (
    <div className="tune-output">
      <div className="output-header">
        <h2>Calculated Tune</h2>
        <button onClick={copyToClipboard} className="copy-btn">
          Copy JSON
        </button>
      </div>
      
      <div className="tune-sections">
        <div className="tune-section">
          <h3>Gearing</h3>
          <p><strong>Final Drive:</strong> {tune.final_drive.toFixed(2)}</p>
          <p><strong>Gear Ratios:</strong> {tune.gear_ratios.map(g => g.toFixed(2)).join(' / ')}</p>
        </div>
        
        <div className="tune-section">
          <h3>Differential</h3>
          <p><strong>Accel:</strong> {tune.differential_accel}%</p>
          <p><strong>Decel:</strong> {tune.differential_decel}%</p>
          <p><strong>Preload:</strong> {tune.differential_preload}%</p>
        </div>
        
        <div className="tune-section">
          <h3>Brakes</h3>
          <p><strong>Brake Bias:</strong> {tune.brake_bias}%</p>
        </div>
        
        <div className="tune-section">
          <h3>Springs & ARBs</h3>
          <p><strong>Spring Front:</strong> {tune.spring_front} lb/in</p>
          <p><strong>Spring Rear:</strong> {tune.spring_rear} lb/in</p>
          <p><strong>ARB Front:</strong> {tune.arb_front}</p>
          <p><strong>ARB Rear:</strong> {tune.arb_rear}</p>
        </div>
        
        <div className="tune-section">
          <h3>Ride Height</h3>
          <p><strong>Front:</strong> {tune.ride_height_front} cm</p>
          <p><strong>Rear:</strong> {tune.ride_height_rear} cm</p>
        </div>
        
        <div className="tune-section">
          <h3>Alignment</h3>
          <p><strong>Camber Front:</strong> {tune.camber_front.toFixed(1)}°</p>
          <p><strong>Camber Rear:</strong> {tune.camber_rear.toFixed(1)}°</p>
          <p><strong>Toe Front:</strong> {tune.toe_front.toFixed(1)}°</p>
          <p><strong>Toe Rear:</strong> {tune.toe_rear.toFixed(1)}°</p>
        </div>
        
        <div className="tune-section">
          <h3>Damping</h3>
          <p><strong>Rebound Front:</strong> {tune.damping_rebound_front.toFixed(1)}</p>
          <p><strong>Rebound Rear:</strong> {tune.damping_rebound_rear.toFixed(1)}</p>
          <p><strong>Compression Front:</strong> {tune.damping_compression_front.toFixed(1)}</p>
          <p><strong>Compression Rear:</strong> {tune.damping_compression_rear.toFixed(1)}</p>
        </div>
        
        <div className="tune-section">
          <h3>Tires</h3>
          <p><strong>Pressure Front:</strong> {tune.tire_pressure_front} PSI</p>
          <p><strong>Pressure Rear:</strong> {tune.tire_pressure_rear} PSI</p>
        </div>
        
        <div className="tune-section">
          <h3>Aero</h3>
          <p><strong>Downforce Front:</strong> {tune.downforce_front} kg</p>
          <p><strong>Downforce Rear:</strong> {tune.downforce_rear} kg</p>
        </div>
        
        <div className="tune-section">
          <h3>Power & Assists</h3>
          <p><strong>Turbo Map:</strong> {tune.turbo_map.toFixed(2)}</p>
          <p><strong>Traction Control:</strong> {tune.traction_control_level}</p>
          <p><strong>ABS:</strong> {tune.abs_level}</p>
        </div>
      </div>
    </div>
  );
}
