import { logger } from '../utils';
import { db as database } from './index'
import { sql } from 'kysely';

export async function initDatabase() {
  await database.schema
    .createTable("users_v2")
    .ifNotExists()
    .addColumn("user_id", "text", (col) => col.primaryKey().notNull())
    .addColumn("player_id", "bigint", (col) => col.notNull())
    .addColumn("username", "text", (col) => col.notNull())
    .addColumn("kingdom", "integer", (col) => col.notNull())
    .addColumn("level", "integer", (col) => col.notNull())
    .addColumn("avatar_url", "text")
    .addColumn("created_at", "text", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn("updated_at", "text", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();


  logger.info('🗃️  | DB initialized!');
}