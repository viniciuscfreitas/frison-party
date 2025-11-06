import * as XLSX from 'xlsx';
import { join } from 'path';
import { getDb, createConvidado } from '../lib/db';

const excelPath = join(process.cwd(), 'dados', 'ListaOficial_FestaFrison.xlsx');

async function extractExcel() {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false });

  const database = getDb();
  const checkStmt = database.prepare('SELECT COUNT(*) as count FROM convidados');
  const existingCount = checkStmt.get() as { count: number };

  if (existingCount.count > 0) {
    console.log(`Banco já possui ${existingCount.count} convidados. Pulando importação.`);
    return;
  }

  let imported = 0;
  for (const row of data as any[]) {
    const nome = row['Nome'] || row['nome'] || row['NOME'] || '';
    const telefone = row['Telefone'] || row['telefone'] || row['TELEFONE'] || row['Tel'] || row['tel'] || '';

    if (nome && nome.trim()) {
      createConvidado(nome.trim(), telefone ? telefone.toString().trim() : undefined);
      imported++;
    }
  }

  console.log(`Importados ${imported} convidados com sucesso.`);
}

extractExcel().catch(console.error);

