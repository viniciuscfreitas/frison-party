import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

export interface Convidado {
  id: number;
  nome: string;
  telefone: string | null;
  entrou: number;
  total_confirmados: number;
  acompanhantes_presentes: number;
  created_at: string;
}

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'convidados.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');

  db.exec(`
    CREATE TABLE IF NOT EXISTS convidados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      total_confirmados INTEGER DEFAULT 1,
      acompanhantes_presentes INTEGER DEFAULT 0,
      entrou INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = db.prepare('PRAGMA table_info(convidados)').all() as Array<{ name: string }>;
  const hasTotalColumn = columns.some((column) => column.name === 'total_confirmados');
  const hasAcompanhantesColumn = columns.some(
    (column) => column.name === 'acompanhantes_presentes'
  );

  if (!hasTotalColumn) {
    db.exec('ALTER TABLE convidados ADD COLUMN total_confirmados INTEGER DEFAULT 1');
  }

  if (!hasAcompanhantesColumn) {
    db.exec('ALTER TABLE convidados ADD COLUMN acompanhantes_presentes INTEGER DEFAULT 0');
  }

  return db;
}

export function getAllConvidados(search?: string): Convidado[] {
  const database = getDb();

  let results: Convidado[];
  if (search && typeof search === 'string' && search.trim()) {
    const stmt = database.prepare(`
      SELECT * FROM convidados
      WHERE nome LIKE ? OR telefone LIKE ?
      ORDER BY nome ASC
    `);
    const searchTerm = `%${search.trim()}%`;
    results = stmt.all(searchTerm, searchTerm) as Convidado[];
  } else {
    const stmt = database.prepare('SELECT * FROM convidados ORDER BY nome ASC');
    results = stmt.all() as Convidado[];
  }

  return results;
}

export function createConvidado(
  nome: string,
  telefone?: string,
  totalConfirmados = 1
): Convidado {
  const database = getDb();
  const stmt = database.prepare(
    'INSERT INTO convidados (nome, telefone, total_confirmados, acompanhantes_presentes) VALUES (?, ?, ?, 0)'
  );
  const telefoneTrimmed = telefone && typeof telefone === 'string' ? telefone.trim() : null;
  const result = stmt.run(nome.trim(), telefoneTrimmed, Math.max(1, totalConfirmados));

  const getStmt = database.prepare('SELECT * FROM convidados WHERE id = ?');
  return getStmt.get(result.lastInsertRowid) as Convidado;
}

export function updateConvidadoStatus(
  id: number,
  entrou: boolean
): Convidado | null {
  const database = getDb();
  
  if (entrou) {
    const stmt = database.prepare('UPDATE convidados SET entrou = 1 WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return null;
    }
  } else {
    const stmt = database.prepare(
      'UPDATE convidados SET entrou = 0, acompanhantes_presentes = 0 WHERE id = ?'
    );
    const result = stmt.run(id);
    if (result.changes === 0) {
      return null;
    }
  }

  const getStmt = database.prepare('SELECT * FROM convidados WHERE id = ?');
  return getStmt.get(id) as Convidado;
}

export function incrementarAcompanhantes(
  id: number,
  delta: number
): Convidado | null {
  const database = getDb();
  
  const updateStmt = delta > 0
    ? database.prepare(
        'UPDATE convidados SET acompanhantes_presentes = MAX(0, acompanhantes_presentes + ?) WHERE id = ? AND entrou = 1'
      )
    : database.prepare(
        'UPDATE convidados SET acompanhantes_presentes = MAX(0, acompanhantes_presentes + ?) WHERE id = ?'
      );
  
  const result = delta > 0
    ? updateStmt.run(delta, id)
    : updateStmt.run(delta, id);
  
  if (result.changes === 0) {
    if (delta > 0) {
      const checkStmt = database.prepare('SELECT id FROM convidados WHERE id = ?');
      const exists = checkStmt.get(id);
      if (!exists) {
        return null;
      }
      throw new Error('Convidado deve estar presente para adicionar acompanhantes');
    }
    return null;
  }
  
  const getFinalStmt = database.prepare('SELECT * FROM convidados WHERE id = ?');
  return getFinalStmt.get(id) as Convidado;
}

export function updateConvidadoInfo(
  id: number,
  nome?: string,
  telefone?: string | null
): Convidado | null {
  const database = getDb();
  const campos: string[] = [];
  const valores: Array<string | number | null> = [];

  if (typeof nome !== 'undefined') {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      throw new Error('Nome inválido.');
    }
    campos.push('nome = ?');
    valores.push(nomeNormalizado);
  }

  if (typeof telefone !== 'undefined') {
    const telefoneNormalizado = telefone === null ? null : telefone.trim() || null;
    campos.push('telefone = ?');
    valores.push(telefoneNormalizado);
  }

  if (campos.length === 0) {
    throw new Error('Nenhum campo informado para atualizar.');
  }

  const stmt = database.prepare(
    `UPDATE convidados SET ${campos.join(', ')} WHERE id = ?`
  );

  const resultado = stmt.run(...valores, id);

  if (resultado.changes === 0) {
    return null;
  }

  const getStmt = database.prepare('SELECT * FROM convidados WHERE id = ?');
  return getStmt.get(id) as Convidado;
}

export function deleteConvidado(id: number): boolean {
  const database = getDb();
  const stmt = database.prepare('DELETE FROM convidados WHERE id = ?');
  const resultado = stmt.run(id);
  return resultado.changes > 0;
}



