import * as XLSX from 'xlsx';
import { join } from 'path';
import { existsSync } from 'fs';
import { getDb, createConvidado } from '../lib/db';

const excelPath = join(process.cwd(), 'dados', 'ListaOficial_FestaFrison.xlsx');

async function extractExcel() {
  console.log(`Procurando arquivo Excel em: ${excelPath}`);
  
  if (!existsSync(excelPath)) {
    console.error(`Erro: Arquivo não encontrado em ${excelPath}`);
    return;
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  console.log(`Lendo planilha: ${sheetName}`);
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { raw: false });
  console.log(`Total de linhas lidas do Excel: ${data.length}`);

  if (data.length === 0) {
    console.log('Aviso: Nenhuma linha encontrada no Excel. Verifique o formato do arquivo.');
    return;
  }

  console.log('Primeira linha (exemplo):', JSON.stringify(data[0], null, 2));

  const database = getDb();
  const checkStmt = database.prepare('SELECT COUNT(*) as count FROM convidados');
  const existingCount = checkStmt.get() as { count: number };

  if (existingCount.count > 0) {
    console.log(`Banco já possui ${existingCount.count} convidados. Pulando importação.`);
    return;
  }

  let imported = 0;
  let skipped = 0;
  for (const row of data as any[]) {
    const nome = row['Nome'] || row['nome'] || row['NOME'] || '';
    const telefone = row['Telefone'] || row['telefone'] || row['TELEFONE'] || row['Tel'] || row['tel'] || '';

    if (nome && nome.trim()) {
      createConvidado(nome.trim(), telefone ? telefone.toString().trim() : undefined);
      imported++;
    } else {
      skipped++;
    }
  }

  console.log(`Importados ${imported} convidados com sucesso.`);
  if (skipped > 0) {
    console.log(`Pulados ${skipped} registros sem nome válido.`);
  }
}

extractExcel().catch(console.error);

