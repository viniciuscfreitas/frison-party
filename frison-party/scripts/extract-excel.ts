import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createConvidado, getDb } from '../lib/db';

const csvPath = join(process.cwd(), 'dados', 'ListaOficial_FestaFrison.csv');

function padronizarNome(nome: string): string {
  if (!nome) return '';
  
  // Remove espaços extras e trim
  let nomePadronizado = nome.trim().replace(/\s+/g, ' ');
  
  // Capitaliza primeira letra de cada palavra
  nomePadronizado = nomePadronizado
    .split(' ')
    .map(palavra => {
      if (palavra.length === 0) return '';
      // Mantém palavras em maiúsculas se forem siglas (2-3 letras)
      if (palavra.length <= 3 && palavra === palavra.toUpperCase()) {
        return palavra;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    })
    .join(' ');
  
  return nomePadronizado;
}

function padronizarTelefone(telefone: string): string | undefined {
  if (!telefone) return undefined;
  
  // Remove tudo exceto números e +
  let telefoneLimpo = telefone.replace(/[^\d+]/g, '');
  
  // Se começa com +, mantém
  if (telefoneLimpo.startsWith('+')) {
    return telefoneLimpo;
  }
  
  // Remove zeros à esquerda desnecessários
  telefoneLimpo = telefoneLimpo.replace(/^0+/, '');
  
  // Se está vazio após limpeza, retorna undefined
  if (telefoneLimpo.length === 0) {
    return undefined;
  }
  
  // Formata telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11) {
    const ddd = telefoneLimpo.substring(0, 2);
    const numero = telefoneLimpo.substring(2);
    
    if (numero.length === 9) {
      // Celular: (XX) XXXXX-XXXX
      return `${ddd} ${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
      // Fixo: (XX) XXXX-XXXX
      return `${ddd} ${numero.substring(0, 4)}-${numero.substring(4)}`;
    }
  }
  
  // Se não couber no formato, retorna como está (pode ser internacional)
  return telefoneLimpo;
}

async function extractCsv() {
  console.log(`Procurando arquivo CSV em: ${csvPath}`);
  
  if (!existsSync(csvPath)) {
    console.error(`Erro: Arquivo não encontrado em ${csvPath}`);
    return;
  }

  const fileContent = readFileSync(csvPath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.log('Aviso: CSV vazio ou sem dados.');
    return;
  }

  // Pula cabeçalho
  const dataLines = lines.slice(1);
  console.log(`Total de linhas lidas do CSV: ${dataLines.length}`);

  const database = getDb();
  const checkStmt = database.prepare('SELECT COUNT(*) as count FROM convidados');
  const existingCount = checkStmt.get() as { count: number };

  if (existingCount.count > 0) {
    console.log(`Banco já possui ${existingCount.count} convidados. Pulando importação.`);
    return;
  }

  let imported = 0;
  let skipped = 0;

  for (const line of dataLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      skipped++;
      continue;
    }

    // Parse CSV simples (considera vírgulas, mas trata nomes com vírgulas)
    const parts = trimmedLine.split(',');
    
    if (parts.length < 1) {
      skipped++;
      continue;
    }

    // Nome é tudo antes da última vírgula (ou primeira se só tiver 2 partes)
    // Telefone é a última parte
    let nome = '';
    let telefone = '';

    if (parts.length === 2) {
      nome = parts[0].trim();
      telefone = parts[1].trim();
    } else if (parts.length > 2) {
      // Nome pode ter vírgulas, telefone é sempre a última parte
      nome = parts.slice(0, -1).join(',').trim();
      telefone = parts[parts.length - 1].trim();
    } else {
      nome = parts[0].trim();
    }

    const nomePadronizado = padronizarNome(nome);
    
    if (!nomePadronizado || nomePadronizado.length < 2) {
      skipped++;
      continue;
    }

    const telefonePadronizado = padronizarTelefone(telefone);
    createConvidado(nomePadronizado, telefonePadronizado);
    imported++;
  }

  console.log(`Importados ${imported} convidados com sucesso.`);
  if (skipped > 0) {
    console.log(`Pulados ${skipped} registros sem nome válido.`);
  }
}

extractCsv().catch(console.error);
