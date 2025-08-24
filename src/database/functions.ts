import { ApiResponse } from "@/commands/kingshot/_accountLink";
import { db } from ".";

const now = Date.now();

export async function upsertUser(discordId: string, apiData: ApiResponse["data"]) {
  await db
    .insertInto("users")
    .values({
      user_id: discordId,
      fid: BigInt(apiData.fid),
      username: apiData.nickname,
      avatar_url: apiData.avatar_image,
      level: apiData.stove_lv,
      state: apiData.kid,
      updated_at: now,
      created_at: now,
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        fid: BigInt(apiData.fid),
        username: apiData.nickname,
        avatar_url: apiData.avatar_image,
        state: apiData.kid,
        level: apiData.stove_lv,
        updated_at: now
      })
    )
    .execute();
}
