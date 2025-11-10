import { upsertUser } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import https from "https";

export type ApiResponse = {
  status: "success" | "error";
  data: {
    playerId: number;
    name: string;
    kingdom: number;
    level: number;
    profilePhoto: string;
  } | null;
  message: string;
  meta?: any;
  timestamp?: string;
};

export async function accountLink(
  _client: ExtendedClient,
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

    if (json.status !== "success" || !json.data) {
      await interaction.editReply({
        content: ":x: Your request does not seem right, please try again later.",
      });
      return;
    }

    const data = json.data;

    const userData = {
      fid: data.playerId,
      nickname: data.name,
      kid: data.kingdom,
      stove_lv: data.level,
      stove_lv_content: data.level,
      avatar_image: data.profilePhoto,
      total_recharge_amount: 0,         // not provided anymore, keep placeholder
    };

    const embed = new EmbedBuilder()
      .setColor(parseInt("#FFEB3B".replace(/^#/, ""), 16))
      .setTitle("Profile Linked: " + data.name)
      .setDescription(
        "**Username:** " +
          data.name +
          "\n" +
          "**Town Center Level:** " +
          data.level +
          "\n" +
          "**Kingdom:** #" +
          data.kingdom
      )
      .setFooter({ text: "Made with ❤️ by Lynnux" });

    if (data.profilePhoto) {
      embed.setThumbnail(data.profilePhoto);
    }

    await interaction.editReply({ embeds: [embed] });
    await upsertUser(interaction.user.id, userData);
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

