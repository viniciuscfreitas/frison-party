import { existsSync } from 'fs';
import { join } from 'path';
import { read, utils } from 'xlsx';
import {
  normalizarTotalConfirmados,
  padronizarNome,
  padronizarTelefone,
} from '../lib/convidado-normalize';
import { readCsvAsUtf8 } from '../lib/encoding';
import { createConvidado, getDb } from '../lib/db';

const csvPath = join(process.cwd(), 'dados', 'ListaOficial_FestaFrison.csv');

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value === null || typeof value === 'undefined') return '';
  return String(value);
};

const sanitize = (value: unknown): string =>
  toString(value).replace(/^[\s,'"`]+|[\s,'"`]+$/g, '').trim();

async function extractCsv() {
  console.log(`Procurando arquivo CSV em: ${csvPath}`);

  if (!existsSync(csvPath)) {
    console.error(`Erro: Arquivo não encontrado em ${csvPath}`);
    return;
  }

  const utf8Buffer = readCsvAsUtf8(csvPath);
  console.log('Arquivo convertido para UTF-8');
  
  const workbook = read(utf8Buffer, { type: 'buffer', codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    console.error('Erro: CSV sem planilha válida.');
    return;
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
  });

  if (rows.length === 0) {
    console.log('Aviso: CSV vazio ou sem dados.');
    return;
  }

  const headerIndex = rows.findIndex((row) => {
    const numero = sanitize(row[1]).toLowerCase();
    const nome = sanitize(row[2]).toLowerCase();
    return numero.startsWith('n') && nome.startsWith('nome');
  });

  if (headerIndex === -1) {
    console.error('Erro: Cabeçalho não encontrado no CSV.');
    return;
  }

  const dataRows = rows.slice(headerIndex + 1);
  console.log(`Total de linhas lidas do CSV: ${dataRows.length}`);

  const database = getDb();
  const checkStmt = database.prepare('SELECT COUNT(*) as count FROM convidados');
  const existingCount = checkStmt.get() as { count: number };

  if (existingCount.count > 0) {
    console.log(`Banco já possui ${existingCount.count} convidados. Pulando importação.`);
    return;
  }

  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const nomeBruto = sanitize(row[2]);
    if (!nomeBruto || /^total/i.test(nomeBruto)) {
      skipped++;
      continue;
    }

    const telefoneBruto = sanitize(row[3]);
    const totalRaw = sanitize(row[7]);

    const nomePadronizado = padronizarNome(nomeBruto);

    if (!nomePadronizado || nomePadronizado.length < 2) {
      skipped++;
      continue;
    }

    const telefonePadronizado = padronizarTelefone(telefoneBruto || undefined);
    const totalConfirmados = normalizarTotalConfirmados(totalRaw);

    createConvidado(nomePadronizado, telefonePadronizado, totalConfirmados);
    imported++;
  }

  console.log(`Importados ${imported} convidados com sucesso.`);
  if (skipped > 0) {
    console.log(`Pulados ${skipped} registros sem nome válido.`);
  }
}

extractCsv().catch(console.error);
