import db from "@/database";
import { fetchUser } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

// This type isn't used directly.
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

export async function accountView(
  _client: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    const user = interaction.user;
    const userInfo = await fetchUser(user.id);

    if (!userInfo) {
      await interaction.editReply({
        content:
          ":x: You don't seem to have an account linked. Please link an account with </account link:1408600312851333191>.",
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.displayName}'s Linked account`)
      .setColor(parseInt("#FFEB3B".replace(/^#/, ""), 16))
      .setDescription(
        "**Username:**  " + userInfo.username + "\n" +
        "**Kingdom:**  " + userInfo.state + "\n" +
        "**TC Level:**  " + userInfo.level + "\n" +
        "**User ID:**  " + userInfo.fid
      )
      .setFooter({ text: "Made with ❤️ by Lynnux" });

    if (userInfo?.avatar_url) {
      embed.setThumbnail(userInfo.avatar_url);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error("Error:", err);
    await interaction.editReply({
      content:
        ":x: Something went wrong when making this request, please try again later.",
    });
  }
}

