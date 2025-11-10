import { db } from ".";

const now = Date.now();

export async function upsertUserV2(
  discordId: string,
  apiData: {
    playerId: number;
    name: string;
    kingdom: number;
    level: number;
    profilePhoto: string;
  } | null
) {
  if (!apiData) return;

  const now = new Date().toISOString();

  await db
    .insertInto("users_v2")
    .values({
      user_id: discordId,
      player_id: BigInt(apiData.playerId),
      username: apiData.name,
      kingdom: apiData.kingdom,
      level: apiData.level,
      avatar_url: apiData.profilePhoto,
      created_at: now,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        player_id: BigInt(apiData.playerId),
        username: apiData.name,
        kingdom: apiData.kingdom,
        level: apiData.level,
        avatar_url: apiData.profilePhoto,
        updated_at: now,
      })
    )
    .execute();

  // cleanup of legacy table
  await db.deleteFrom("users").where("user_id", "=", discordId).execute();
}

export async function fetchUserV2(discordId: string) {
  return await db
    .selectFrom("users_v2")
    .selectAll()
    .where("user_id", "=", discordId)
    .executeTakeFirst();
}