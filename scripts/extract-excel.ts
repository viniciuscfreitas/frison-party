import { existsSync } from 'fs';
import { join } from 'path';
import {
  normalizarTotalConfirmados,
  padronizarNome,
  padronizarTelefone,
} from '../lib/convidado-normalize';
import { parseCsv } from '../lib/csv-parser';
import { createConvidado, getDb } from '../lib/db';

const csvPath = join(process.cwd(), 'dados', 'ListaOficial_FestaFrison.csv');

async function extractCsv() {
  console.log(`Procurando arquivo CSV em: ${csvPath}`);

  if (!existsSync(csvPath)) {
    console.error(`Erro: Arquivo não encontrado em ${csvPath}`);
    return;
  }

  console.log('Lendo CSV...');
  const rows = parseCsv(csvPath);
  console.log(`Total de linhas lidas: ${rows.length}`);

  if (rows.length === 0) {
    console.log('Aviso: CSV vazio ou sem dados.');
    return;
  }

  const headerIndex = rows.findIndex((row) => {
    const numero = row[1]?.toLowerCase().trim() || '';
    const nome = row[2]?.toLowerCase().trim() || '';
    return numero.startsWith('n') && nome.startsWith('nome');
  });

  if (headerIndex === -1) {
    console.error('Erro: Cabeçalho não encontrado no CSV.');
    return;
  }

  const dataRows = rows.slice(headerIndex + 1);
  console.log(`Total de dados: ${dataRows.length}`);

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
    const nomeBruto = (row[2] || '').trim();
    if (!nomeBruto || /^total/i.test(nomeBruto)) {
      skipped++;
      continue;
    }

    const telefoneBruto = (row[3] || '').trim();
    const totalRaw = (row[7] || '').trim();

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
