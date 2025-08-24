import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  customId: (id: string): boolean => id.startsWith('farmable-'),
  async execute(
    _client: ExtendedClient,
    interaction: ButtonInteraction,
  ):Promise<void> {
    const [, number] = interaction.customId.split("-");
    const allowedUserIds = ['705306248538488947'];

    if (!allowedUserIds.includes(interaction.user.id)) {
      await interaction.reply({
        content: 'You are not the owner of this account.',
        flags: 'Ephemeral',
      });
      return;
    }

    try {
      const modal = new ModalBuilder()
        .setCustomId(`farmable-${number}`)
        .setTitle(`Farm ${number} is farmable.`);
      const breadInput = new TextInputBuilder()
        .setCustomId('bread')
        .setLabel('Bread amount:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('NaN')
        .setRequired(true);
      const woodInput = new TextInputBuilder()
        .setCustomId('wood')
        .setLabel('Wood amount:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('NaN')
        .setRequired(true);
      const stoneInput = new TextInputBuilder()
        .setCustomId('stone')
        .setLabel('Stone amount:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('NaN')
        .setRequired(true);
      const ironInput = new TextInputBuilder()
        .setCustomId('iron')
        .setLabel('Iron amount:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('NaN')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(breadInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(woodInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(stoneInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(ironInput),
      );
      await interaction.showModal(modal);
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error: ' + err.stack)
      }
    }
  }
};