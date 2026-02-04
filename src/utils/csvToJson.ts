/**
 * Utility to convert CSV files to JSON format
 * Used to create the data/schema files from CSV sources
 */

export interface CsvRow {
  [key: string]: string | number;
}

/**
 * Parse CSV string to array of objects
 * @param csvText - Raw CSV text content
 * @param options - Parsing options
 * @returns Array of row objects
 */
export function csvToJson(
  csvText: string,
  options: {
    delimiter?: string;
    parseNumbers?: boolean;
  } = {}
): CsvRow[] {
  const { delimiter = ',', parseNumbers = false } = options;

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(delimiter).map(h => h.trim());

  // Parse rows
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter).map(v => v.trim());
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      let value: string | number = values[index] || '';
      
      // Optionally parse numbers
      if (parseNumbers && value !== '') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          value = numValue;
        }
      }

      row[header] = value;
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Convert CSV file content to JSON string
 * @param csvText - Raw CSV text content
 * @param options - Parsing and formatting options
 * @returns JSON string
 */
export function csvToJsonString(
  csvText: string,
  options: {
    delimiter?: string;
    parseNumbers?: boolean;
    pretty?: boolean;
  } = {}
): string {
  const { pretty = true, ...parseOptions } = options;
  const data = csvToJson(csvText, parseOptions);
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * Convert FH5 cars CSV to typed JSON format
 */
export interface FH5Car {
  manufacturer: string;
  model: string;
  year: number;
  pi: number;
  drivetrain: string;
  power_hp: number;
  weight_lbs: number;
  engine_type: string;
  aspiration: string;
  displacement_l: number;
}

export function parseFH5Cars(csvText: string): FH5Car[] {
  return csvToJson(csvText, { parseNumbers: true }) as FH5Car[];
}

/**
 * Convert Forza parts CSV to structured schema
 */
export interface ForzaPart {
  id: string;
  label: string;
  control: 'button' | 'dropdown' | 'text';
  options?: string[];
  default?: string;
  hint?: string;
  min?: number;
  max?: number;
  unit?: string;
}

export interface ForzaPartsSchema {
  sections: {
    [sectionName: string]: {
      parts: {
        [partName: string]: Omit<ForzaPart, 'id' | 'label'>;
      };
    };
  };
}

export function parseForzaPartsCSV(csvText: string): ForzaPartsSchema {
  const rows = csvToJson(csvText);
  const schema: ForzaPartsSchema = { sections: {} };

  for (const row of rows) {
    const section = row.section as string;
    const part = row.part as string;
    const option = row.option as string;
    const control = (row.control as string) || 'button';
    const hint = (row.hint as string) || '';

    // Initialize section if needed
    if (!schema.sections[section]) {
      schema.sections[section] = { parts: {} };
    }

    // Initialize part if needed
    if (!schema.sections[section].parts[part]) {
      schema.sections[section].parts[part] = {
        control: control as 'button' | 'dropdown' | 'text',
        hint: hint || undefined
      };
    }

    // Add options for button/dropdown controls
    if (option && control !== 'text') {
      if (!schema.sections[section].parts[part].options) {
        schema.sections[section].parts[part].options = [];
      }
      if (!schema.sections[section].parts[part].options!.includes(option)) {
        schema.sections[section].parts[part].options!.push(option);
      }
    }

    // Handle text control defaults
    if (control === 'text' && option) {
      schema.sections[section].parts[part].default = option;
    }
  }

  return schema;
}
