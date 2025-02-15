import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './client';

// マイグレーションを実行
async function main() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed');
  } catch (error) {
    console.error('Error performing migrations:', error);
    process.exit(1);
  }
  process.exit(0);
}

main(); 
