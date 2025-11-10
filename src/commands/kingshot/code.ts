import { ApplicationIntegrationType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
import { fetchUserV2 } from '@/database/functions';

export default {
  data: new SlashCommandBuilder()
    .setName('code')
    .setDescription('Redeem a code.')
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to redeem.')
        .setRequired(true)
        .setMinLength(3)
    ),
  async execute(
    _client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    await interaction.deferReply({ flags:"Ephemeral" })

    const user = interaction.user;
    const userInfo = await fetchUserV2(user.id)
    
    if (!userInfo) {
      await interaction.editReply({ content: ':x: You don\'t seem to have an account linked. Please link a account with </account link:1408600312851333191> ' });
      return;
    };

    const fid = Number(userInfo.player_id);
    const code = interaction.options.getString('code')?.toUpperCase()
    if (!code) { await interaction.editReply({ content: ':x: Code not found.' }); return; }

    const message = await redeemCode(fid, code);
    const embed = new EmbedBuilder()
      .setFooter({ text: 'Made with ❤️ by Lynnux' });


    if (message === "Redeemed, please claim the rewards in your mail!") {
      embed
        .setTitle('Code Redeemed')
        .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
        .setDescription(
          'The gift-code **' + code + '** has been redeemed on ' + userInfo.username + ' from #' + userInfo.kingdom + '\n' +
          '-# *Rewards will be directly sent to Character’s mail after redemption'
        )
    } else {
      embed
        .setColor(parseInt('#FF3333'.replace(/^#/, ''), 16))
        .setTitle('Code Couldn\'t be redeemed')
        .setDescription(message)
    }
    
    if (userInfo.avatar_url) {
      embed.setThumbnail(userInfo.avatar_url)
    }

    await interaction.editReply({ embeds: [embed] })
  }
}

async function redeemCode(playerId: number, giftCode: string): Promise<string> {
  try {
    const res = await fetch('https://kingshot.net/api/gift-codes/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, giftCode })
    });

    const json = await res.json() as { status: string; message: string };

    if (json.status === 'success') return 'success';
    return json.message || 'Unknown error.';
  } catch (err) {
    console.error('Redeem Code Error:', err);
    return 'Failed to reach the server.';
  }
}
