import iconv from 'iconv-lite';
import { readFileSync } from 'fs';

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);

export function detectEncoding(buffer: Buffer): 'utf8' | 'windows1252' {
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(UTF8_BOM)) {
    return 'utf8';
  }

  try {
    const utf8String = buffer.toString('utf8');
    if (/[\uFFFD]/.test(utf8String)) {
      return 'windows1252';
    }
    const reEncoded = Buffer.from(utf8String, 'utf8');
    if (buffer.equals(reEncoded)) {
      return 'utf8';
    }
  } catch {
    return 'windows1252';
  }

  return 'windows1252';
}

export function convertToUtf8(buffer: Buffer): Buffer {
  const encoding = detectEncoding(buffer);
  
  if (encoding === 'utf8') {
    return buffer;
  }
  
  const utf8String = iconv.decode(buffer, 'windows1252');
  return Buffer.from(utf8String, 'utf8');
}

export function readCsvAsUtf8(filePath: string): Buffer {
  const buffer = readFileSync(filePath);
  return convertToUtf8(buffer);
}

export function fixLegacyEncoding(value: string): string {
  if (!value) return value;
  
  try {
    const bytes = Buffer.from(value, 'latin1');
    const fixed = iconv.decode(bytes, 'windows1252');
    return fixed !== value ? fixed : value;
  } catch {
    return value;
  }
}

export function normalizeConvidadoFromDb(convidado: Convidado): Convidado {
  return {
    ...convidado,
    nome: fixLegacyEncoding(convidado.nome),
    telefone: convidado.telefone ? fixLegacyEncoding(convidado.telefone) : null,
  };
}

export interface Convidado {
  id: number;
  nome: string;
  telefone: string | null;
  entrou: number;
  total_confirmados: number;
  acompanhantes_presentes: number;
  created_at: string;
}

