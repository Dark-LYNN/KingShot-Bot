import db from "@/database";
import { fetchUser, upsertUser } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { makeSign } from "@/utils/api";
import Database from "better-sqlite3";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import https from 'https';
import { URL } from 'url';

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

export async function accountDisconnect(
  _client: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    const user = interaction.user;

    const userInfo = await fetchUser(user.id)
    
    if (!userInfo) {
      await interaction.editReply({ content: ':x: You don\'t seem to have an account linked. Please link a account with </account link:1408600312851333191> ' });
      return;
    };

    const embed = new EmbedBuilder()
      .setTitle(interaction.user.displayName + '\'s account disconnected')
      .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
      .setDescription('The account ' + userInfo.username + ' from #' + userInfo.state + ' has been disconnect from <@' + user.id + '>.')
      .setFooter({text: 'Made with ❤️ by Lynnux'});

    await interaction.editReply({ embeds: [embed] });
    
    await db
      .deleteFrom('users')
      .where('user_id', '=', user.id)
      .execute();
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