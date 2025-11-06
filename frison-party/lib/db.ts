import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'convidados.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS convidados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      entrou INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
}

export function getAllConvidados(search?: string) {
  const database = getDb();
  if (search) {
    const stmt = database.prepare(`
      SELECT * FROM convidados 
      WHERE nome LIKE ? OR telefone LIKE ?
      ORDER BY nome ASC
    `);
    const searchTerm = `%${search}%`;
    return stmt.all(searchTerm, searchTerm);
  }
  const stmt = database.prepare('SELECT * FROM convidados ORDER BY nome ASC');
  return stmt.all();
}

export function getConvidadoById(id: number) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM convidados WHERE id = ?');
  return stmt.get(id);
}

export function createConvidado(nome: string, telefone?: string) {
  const database = getDb();
  const stmt = database.prepare('INSERT INTO convidados (nome, telefone) VALUES (?, ?)');
  const result = stmt.run(nome, telefone || null);
  return { id: result.lastInsertRowid, nome, telefone };
}

export function updateCheckIn(id: number, entrou: boolean) {
  const database = getDb();
  const stmt = database.prepare('UPDATE convidados SET entrou = ? WHERE id = ?');
  stmt.run(entrou ? 1 : 0, id);
  return getConvidadoById(id);
}

