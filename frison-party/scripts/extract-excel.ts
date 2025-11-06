import { existsSync } from 'fs';
import { join } from 'path';
import * as XLSX from 'xlsx';
import { createConvidado, getDb } from '../lib/db';

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

  // Detectar nomes das colunas automaticamente
  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];
  console.log('Colunas encontradas:', allColumns.join(', '));

  // Procurar coluna de nome (case insensitive, contém "nome")
  const nomeColumn = allColumns.find(col => 
    col.toLowerCase().includes('nome')
  ) || allColumns.find(col => 
    ['Nome', 'nome', 'NOME', 'Nome completo', 'Nome Completo'].includes(col)
  );

  // Procurar coluna de telefone (case insensitive)
  const telefoneColumn = allColumns.find(col => 
    col.toLowerCase().includes('telefone') || col.toLowerCase().includes('tel')
  ) || allColumns.find(col => 
    ['Telefone', 'telefone', 'TELEFONE', 'Tel', 'tel'].includes(col)
  );

  console.log(`Coluna de nome detectada: ${nomeColumn || 'NÃO ENCONTRADA'}`);
  console.log(`Coluna de telefone detectada: ${telefoneColumn || 'NÃO ENCONTRADA'}`);

  if (!nomeColumn) {
    console.error('Erro: Não foi possível encontrar uma coluna de nome. Colunas disponíveis:', allColumns.join(', '));
    return;
  }

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
    const nome = row[nomeColumn] || '';
    const telefone = telefoneColumn ? (row[telefoneColumn] || '') : '';

    // Pular linhas que parecem ser cabeçalhos ou metadados
    const nomeStr = nome ? nome.toString().trim() : '';
    if (!nomeStr || 
        nomeStr.toLowerCase().includes('data') || 
        nomeStr.toLowerCase().includes('horário') ||
        nomeStr.toLowerCase().includes('local') ||
        nomeStr.length < 2) {
      skipped++;
      continue;
    }

    createConvidado(nomeStr, telefone ? telefone.toString().trim() : undefined);
    imported++;
  }

  console.log(`Importados ${imported} convidados com sucesso.`);
  if (skipped > 0) {
    console.log(`Pulados ${skipped} registros sem nome válido.`);
  }
}

extractExcel().catch(console.error);

