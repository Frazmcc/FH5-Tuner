# FH5 Tuner

A web-based tune generator for Forza Horizon 5. Build your car by selecting parts and upgrades, then get optimized tune settings based on your driving style and weather conditions.

## Features

- **Interactive Car Builder**: Select from hundreds of parts across Tires, Rims, Aero, Engine, Platform, and Drivetrain
- **Multiple Tune Types**: Road, Race, Drift, Offroad, Rally, Cruise, and Drag presets
- **Weather Conditions**: Dry and Wet weather modifiers
- **270+ Rims**: Browse and select from authentic FH5 rim catalog
- **Rule-Based Tuner**: Get instant numeric tune outputs for all parameters
- **Copy to Clipboard**: Export tune as JSON for easy sharing

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
├── data/                          # Data files
│   ├── forza.csv                  # Original parts CSV
│   ├── FH5 Rim List - Dem Rims Boiiiiii.csv  # Original rims CSV
│   ├── forza_schema.json          # Parsed parts schema
│   └── fh5_rims.json              # Parsed rims database (271 entries)
├── src/
│   ├── components/
│   │   ├── PartGroup.jsx          # Part selection UI
│   │   └── TuneOutput.jsx         # Tune results display
│   ├── utils/
│   │   └── tuner.js               # Rule-based tune calculator
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── styles.css                 # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## How It Works

1. **Select Parts**: Choose your upgrades from each section (Tires, Engine, Platform, etc.)
2. **Choose Tune Type**: Select your driving style (Road, Race, Drift, etc.)
3. **Set Weather**: Pick Dry or Wet conditions
4. **Get Tune**: The tuner automatically calculates optimal settings for:
   - Gearing (final drive & gear ratios)
   - Differential (accel/decel/preload)
   - Brakes (bias)
   - Springs & Anti-Roll Bars
   - Ride Height
   - Alignment (camber/toe)
   - Damping (rebound/compression)
   - Tire Pressure
   - Downforce
   - Turbo Mapping & Assists

## Tuner Logic

The tuner uses rule-based presets for each tune type:
- **Road**: Balanced street performance
- **Race**: Maximum track performance
- **Drift**: Low differential lock for sliding
- **Offroad**: High ride height, softer springs
- **Rally**: Mixed surface optimization
- **Cruise**: Comfort-oriented settings
- **Drag**: Launch and acceleration focused

Wet weather applies global modifiers:
- Reduced tire pressure
- Lower differential acceleration
- Increased camber
- More downforce
- Higher traction control

## Future Improvements

- Per-car tuning rules based on drivetrain layout, weight distribution, and power
- Machine learning model trained on real tune datasets
- More detailed part interactions
- Tune sharing and community ratings
- Mobile-responsive design improvements

## License

MIT
