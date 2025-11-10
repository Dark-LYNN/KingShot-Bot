import db from "@/database";
import { fetchUser } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export async function accountDisconnect(
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
      .setTitle(`${interaction.user.displayName}'s account disconnected`)
      .setColor(parseInt("#FFEB3B".replace(/^#/, ""), 16))
      .setDescription(
        `The account **${userInfo.username}** from **#${userInfo.state}** has been disconnected from <@${user.id}>.`
      )
      .setFooter({ text: "Made with ❤️ by Lynnux" });

    await interaction.editReply({ embeds: [embed] });

    await db.deleteFrom("users").where("user_id", "=", user.id).execute();
  } catch (err) {
    console.error("Error:", err);
    await interaction.editReply({
      content:
        ":x: Something went wrong when making this request, please try again later.",
    });
  }
}

