import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { ExtendedClient } from '@/types/extendedClient';

export default {
  customId: (id: string): boolean => id.startsWith('farmable-'),
  async execute(
    client: ExtendedClient,
    interaction: ModalSubmitInteraction<'cached'>,
  ): Promise<void> {
    const [, number] = interaction.customId.split('-');
    const bread = interaction.fields.getTextInputValue("bread");
    const wood = interaction.fields.getTextInputValue("wood");
    const stone = interaction.fields.getTextInputValue("stone");
    const iron = interaction.fields.getTextInputValue("iron");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`farmed-${number}`)
          .setLabel("Farmed")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false),
        new ButtonBuilder()
          .setCustomId(`farmable-${number}`)
          .setLabel("farmable")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      ).toJSON();

    const embed = new EmbedBuilder()
      .setTitle(`END FARM ${number.toUpperCase()}`)
      .setDescription(`**Username:** [end]END_FARM_${number.toLocaleUpperCase()}\n**Can be farmed:** True`)
      .addFields(
        {
          name: "Resources:",
          value: `<:Bread:1407349904606756934> Bread: ${bread}\n<:Wood:1407349664906477750> Wood: ${wood}\n<:Stone:1407350022193807662> Stone: ${stone}\n<:Iron:1407349744421830851> Iron: ${iron}`,
          inline: false
        },
      )
      .setThumbnail(`https://cdn.lynnux.xyz/images/END-${number.toLowerCase()}.png?v=3`)
      .setColor("#f58f00")
      .setFooter({
        text: "Bot made with ❤️ by Lynnux.",
      });

    await interaction.message?.edit({ embeds: [embed], components: [row] });
    await interaction.reply({
      content: "Farm updated successfully ✅",
      flags: 'Ephemeral',
    });
  },
};