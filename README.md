# FH5 Tuner

A web-based tune generator for Forza Horizon 5. Select a car, choose your upgrades, pick a tune type, and get complete, race-ready tune settings optimized for your driving style and conditions.

## Features

- **Car Database**: 30+ popular FH5 cars with accurate specs (PI, drivetrain, power, weight)
- **Smart Car Picker**: Searchable dropdown with full car specs and filtering
- **Interactive Parts Builder**: Select from hundreds of authentic FH5 parts across Tires, Rims, Aero, Engine, Platform, and Drivetrain
- **Multiple Tune Types**: Street, Road, Race, Drift, Rally, Offroad, Cruise, and Drag presets
- **Weather Conditions**: Dry and Wet weather modifiers
- **270+ Rims**: Browse and select from authentic FH5 rim catalog
- **Hybrid Rule-Based Tuner**: Car-specific tuning algorithm that generates exact numeric values for:
  - Gearing (final drive + 6-speed ratios)
  - Differential (accel/decel/preload, AWD center/front/rear)
  - Brakes (bias + pressure)
  - Suspension (springs, ARBs, ride height)
  - Alignment (camber, toe, caster)
  - Damping (rebound/compression)
  - Tires (compound, pressures)
  - Aero (front/rear downforce)
  - Electronics (TC, ABS, stability, turbo mapping)
- **Export Options**: 
  - Copy-ready plain text tune sheet for manual FH5 entry
  - Downloadable JSON for sharing and analysis

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

### Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── data/                          # Data files
│   ├── fh5_cars.csv               # Car database (CSV source)
│   ├── forza.csv                  # Parts database (CSV source)
│   ├── rims.csv                   # Rims database (CSV source)
│   ├── FH5 Rim List - Dem Rims Boiiiiii.csv  # Original rims CSV
│   ├── fh5_rims.json              # Parsed rims (JSON, 271 entries)
│   ├── forza_schema.json          # Original parts schema (JSON)
│   └── schema/                    # Generated JSON schemas
│       ├── fh5_cars.json          # Parsed car database
│       └── forza_parts.json       # Enhanced parts schema
├── src/
│   ├── components/
│   │   ├── CarPicker.tsx          # Searchable car selection UI
│   │   ├── PartsForm.tsx          # Dynamic parts form renderer
│   │   ├── PartGroup.jsx          # Legacy part group component
│   │   └── TuneOutput.jsx         # Legacy tune output display
│   ├── pages/
│   │   └── Calculator.tsx         # Main calculator page
│   ├── tuner/
│   │   └── engine.ts              # Hybrid rule-based tuning algorithm
│   ├── utils/
│   │   ├── csvToJson.ts           # CSV-to-JSON converter utility
│   │   └── tuner.js               # Legacy tuner (simple presets)
│   ├── App.jsx                    # Legacy app component
│   ├── main.jsx                   # React entry point
│   └── styles.css                 # Global styles
├── tests/
│   └── engine.test.ts             # Unit tests for tuning engine
├── public/
│   └── sample_tune_output.md      # Example GT-R Race/Dry tune
├── index.html
├── package.json
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Vitest test configuration
└── vite.config.js                 # Vite bundler configuration
```
│   ├── components/
│   │   ├── PartGroup.jsx          # Part selection UI
│   │   └── TuneOutput.jsx         # Tune results display
│   ├── utils/
│   │   └── tuner.js               # Rule-based tune calculator

## How It Works

### Car Selection

The car picker loads from `data/schema/fh5_cars.json` (generated from `data/fh5_cars.csv`). Each car entry includes:
- Manufacturer, model, year
- Performance Index (PI)
- Drivetrain type (RWD/FWD/AWD/4WD)
- Power (hp) and weight (lbs)
- Engine type, aspiration, displacement

The picker is fully searchable - filter by any car attribute.

### Parts & Upgrades

The parts form renders from `data/schema/forza_parts.json` (enhanced from `data/forza.csv`). Each part has:
- Control type (button group, dropdown, or text input)
- Available options
- Hints and defaults

Rims are loaded from `data/fh5_rims.json` with full manufacturer/style/size/price data.

### Tuning Algorithm

The hybrid rule-based algorithm (`src/tuner/engine.ts`) generates complete tunes by:

1. **Gearing**: Calculates final drive and gear ratios based on power-to-weight ratio and tune type
   - Drag: Short gears for acceleration
   - Race: Balanced for track speed
   - Cruise: Long gears for highway efficiency

2. **Differential**: Maps drivetrain and tune type to lock percentages
   - AWD gets center diff + front/rear distributions
   - Drift uses low lock for easy sliding
   - Drag uses max lock for traction

3. **Suspension**: Weight-adjusted spring rates and ride heights
   - Heavier cars get proportionally stiffer springs
   - Offroad/Rally: Higher ride height, softer springs
   - Race: Lower ride height, stiff springs

4. **Alignment**: Tune-type-specific camber, toe, and caster
   - Race: Aggressive camber for cornering grip
   - Drift: Extra camber + toe-out for angle
   - Drag: Minimal camber for straight-line traction

5. **Damping**: Calculated proportionally from spring rates (~1.5-1.7% of spring rate)

6. **Tires**: Compound selection and pressure based on tune type and drivetrain
   - Drag: High front/low rear pressure for weight transfer
   - Race: Lower pressures for grip
   - Wet weather: -2 psi across the board

7. **Aero**: Downforce based on PI and tune type
   - High-PI race cars get maximum downforce
   - Drag/Drift: Minimal or no aero

8. **Electronics**: Assists and turbo mapping
   - Race/Drift/Drag: All assists off
   - Offroad/Cruise: TC and ABS on

9. **Weather Modifiers**: Wet conditions apply global adjustments
   - Lower tire pressures
   - Reduced diff lock
   - More camber and downforce
   - Higher TC level

### Output Formats

1. **Plain Text**: Human-readable tune sheet with labeled sections matching FH5 tuning screens - ready to copy and manually enter in-game

2. **JSON**: Structured data format for sharing, archiving, or programmatic use

## Editing Data

### Adding New Cars

Edit `data/fh5_cars.csv` and add rows following this format:

```csv
manufacturer,model,year,pi,drivetrain,power_hp,weight_lbs,engine_type,aspiration,displacement_l
Ford,Mustang GT,2024,720,RWD,500,3800,V8,Naturally Aspirated,5.0
```

Then regenerate the JSON:

```bash
node -e "
const fs = require('fs');
const csv = fs.readFileSync('data/fh5_cars.csv', 'utf8');
const lines = csv.trim().split('\\n');
const headers = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  const obj = {};
  headers.forEach((h, i) => obj[h] = isNaN(values[i]) ? values[i] : Number(values[i]));
  return obj;
});
fs.writeFileSync('data/schema/fh5_cars.json', JSON.stringify(rows, null, 2));
"
```

### Adding New Rims

Edit `data/rims.csv` following this format:

```csv
Style,Manufacturer,Name,Size,Price
Sport,BBS,SR,15,5000
Racing,Volk,TE37,17,8000
```

The rims JSON is already generated and committed.

### Modifying Parts Schema

Edit `data/forza.csv` to add/modify upgrade options. The CSV uses this structure:

```csv
section,part,option,control,hint
Tires,Front Compound,Race,button,
Engine,Turbo,Street,button,
Tuning,Final Drive,3.50,text,Enter final drive ratio (2.0-5.0)
```

Control types:
- `button`: Radio-style button group
- `dropdown`: Select dropdown (used for rims)
- `text`: Free-text numeric input

## Contributing

### Adding New Tune Types

Edit `src/tuner/engine.ts` and add a new case to each `switch (tuneType)` block. Follow existing patterns for:
- Gearing ratios
- Differential percentages
- Spring rates and ride heights
- Camber/toe values
- Electronics settings

### Improving Tune Rules

The algorithm is deterministic and rule-based. To improve it:

1. Study real FH5 tunes for specific cars/types
2. Update formulas in `engine.ts` (e.g., spring rate calculations, power-to-weight multipliers)
3. Run tests: `npm test`
4. Validate output in `public/sample_tune_output.md`

### Adding Tests

Add new test cases to `tests/engine.test.ts` for:
- New car fixtures
- Edge cases (very light/heavy cars, extreme power-to-weight)
- Tune type combinations
- Upgrade interactions

## Future Improvements

- [ ] Per-car tuning overrides (e.g., GT-R-specific rules)
- [ ] Machine learning model trained on community tunes
- [ ] More detailed upgrade interactions (e.g., aero affecting downforce calculations)
- [ ] Tune sharing and community ratings
- [ ] Mobile-responsive design improvements
- [ ] Live preview / visualization of settings
- [ ] Import existing tunes for comparison

## License

MIT
2026