import { readCsvAsUtf8 } from './encoding';

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function parseCsv(filePath: string): string[][] {
  const buffer = readCsvAsUtf8(filePath);
  const content = buffer.toString('utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  return lines.map(parseCsvLine);
}

