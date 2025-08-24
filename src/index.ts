import { initDatabase } from './database/migrate';
import 'module-alias/register';
import './bot/index';

async function main() {
  await initDatabase()
}

main().catch(console.error)