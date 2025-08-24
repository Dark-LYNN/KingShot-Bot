import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';

export default {
  customId: (id: string): boolean => id.startsWith('farmed-'),
  async execute(
    _client: ExtendedClient,
    interaction: ButtonInteraction,
  ):Promise<void> {
    const [, number] = interaction.customId.split("-");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`farmed-${number}`)
          .setLabel("Farmed")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
      
        new ButtonBuilder()
          .setCustomId(`farmable-${number}`)
          .setLabel("farmable")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(false)
      ).toJSON();

    const embed = new EmbedBuilder()
      .setTitle(`END FARM ${number.toUpperCase()}`)
      .setDescription(`**Username:** [end]END_FARM_${number.toLocaleUpperCase()}\n**Can be farmed:** False`)
      .addFields(
        {
          name: "Resources:",
          value: "<:Bread:1407349904606756934> Bread: 0\n<:Wood:1407349664906477750> Wood: 0\n<:Stone:1407350022193807662> Stone: 0\n<:Iron:1407349744421830851> Iron: 0",
          inline: false
        },
      )
      .setThumbnail(`https://cdn.lynnux.xyz/images/END-${number.toLowerCase()}.png?v=3`)
      .setColor("#f58f00")
      .setFooter({
        text: "Bot made with ❤️ by Lynnux.",
      });

    await interaction.message.edit({ components: [row], embeds: [embed]})
    await interaction.reply({
      content: 'We have marked this account as "farmed", enjoy the resources.',
      flags: 'Ephemeral',
    });
  },
};
