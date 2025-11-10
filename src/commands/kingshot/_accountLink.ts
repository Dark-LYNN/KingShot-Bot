import { upsertUserV2 } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ApiResponse } from "@/types/api";
import https from "https";
import { getTierEmoji, trueGoldTiers } from "@/utils/kingshot";
export async function accountLink(
  client: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    const fid = parseInt(interaction.options.getString("id") ?? "0", 10);
    if (!fid) {
      await interaction.editReply({
        content: ":x: Please provide a valid player ID.",
      });
      return;
    }

    const json = await getPlayerInfo(fid);

    if (!json.data) {
      throw new Error("API returned null data");
    }
    
    if (json.status !== "success" || !json.data) {
      await interaction.editReply({
        content: ":x: Your request does not seem right, please try again later.",
      });
      return;
    }

    const data = json.data;

    await upsertUserV2(interaction.user.id, data);

    const tier = trueGoldTiers.find(t => data.level >= t.min && data.level <= t.max)
    const emote = tier ? client.emoji(tier.emoji) : '';
    const levelEmote = emote ? ' ' + emote : '';

    const embed = new EmbedBuilder()
      .setColor(parseInt("#FFEB3B".replace(/^#/, ""), 16))
      .setTitle("Profile Linked: " + data.name)
      .setDescription(
        "**Username:** " +
          data.name +
          "\n" +
          "**Town Center Level:** " +
          data.level + levelEmote + ` ${tier?.emoji}` +
          "\n" +
          "**Kingdom:** #" +
          data.kingdom
      )
      .setFooter({ text: "Made with ❤️ by Lynnux" });

    if (data.profilePhoto) {
      embed.setThumbnail(data.profilePhoto);
    }

    await interaction.editReply({ embeds: [embed] });
    await upsertUserV2(interaction.user.id, data);
  } catch (err) {
    console.error("Error:", err);
    await interaction.editReply({
      content:
        ":x: Something went wrong when making this request, please try again later.",
    });
  }
}

function getPlayerInfo(playerId: number): Promise<ApiResponse> {
  const url = `https://kingshot.net/api/player-info?playerId=${playerId}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json: ApiResponse = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

