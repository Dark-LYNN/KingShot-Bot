import db from "@/database";
import { ExtendedClient } from "@/types/extendedClient";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export type ApiResponse = {
  code: number;       // Status Code
  data: {
    fid: number,      // UserID
    nickname: string, // UserName
    kid: number,      // KingdomID
    stove_lv: number, // Level
    stove_lv_content: number,
    avatar_image: string; // UserAvatar
    total_recharge_amount: number
  },
  msg: string;        // Status Message
  err_code: string;   // Error Code
};

export async function accountView(
  _client: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    const user = interaction.user;

    const userInfo = await db
      .selectFrom('users')
      .where('user_id', '=', user.id)
      .selectAll()
      .executeTakeFirst();
    
    if (!userInfo) {
      await interaction.editReply({ content: ':x: You don\'t seem to have an account linked. Please link a account with </account link:1408600312851333191> ' });
      return;
    };

    const embed = new EmbedBuilder()
      .setTitle(interaction.user.displayName + '\'s Linked account')
      .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
      .setDescription(
        '**Username:**  ' + userInfo.username + '\n' +
        '**Kingdom:**  ' + userInfo.state + '\n' +
        '**TC Level:**  ' + userInfo.level + '\n' +
        '**User ID:**  ' + userInfo.fid
      )
      .setFooter({text: 'Made with ❤️ by Lynnux'});

    if (userInfo?.avatar_url) {
      embed.setThumbnail(userInfo.avatar_url);
    };

    interaction.editReply({embeds: [embed]});
  } catch (err) {
    if (err instanceof Error) {
      console.log('Error: ' + err.message);
      console.log('Error Stack: ' + err.stack);
    } else {
      console.log(err);
    };
    await interaction.editReply({ content: ":x: Something went wrong when making this request, please try again later." });
  };
};