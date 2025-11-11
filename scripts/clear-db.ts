import { getDb } from '../lib/db';

function clearDatabase() {
  const database = getDb();
  
  const stmt = database.prepare('DELETE FROM convidados');
  const result = stmt.run();
  
  console.log(`Banco limpo: ${result.changes} convidados removidos.`);
}

clearDatabase();

