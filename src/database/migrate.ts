import { logger } from '../utils';
import { db as database } from './index'
import { sql } from 'kysely';

export async function initDatabase() {
  await database.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('user_id', 'text', col => col.primaryKey().notNull())
    .addColumn('fid', 'bigint', col => col.unique().notNull())
    .addColumn('username', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('state', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('level', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('created_at', 'integer', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'integer', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  logger.info('🗃️  | DB initialized!');
}