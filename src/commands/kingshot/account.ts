import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
import { accountLink } from './_accountLink';
import { accountView } from './_accountView';
import { accountDisconnect } from './_accountDisconnect';

export default {
  data: new SlashCommandBuilder()
    .setName('account')
    .setDescription('Your account settings')
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addSubcommand(subcommand =>
      subcommand.setName('link')
        .setDescription('Link your Kingshot account.')
        .addStringOption(option =>
          option.setName('id')
            .setDescription('Your user ID?')
            .setRequired(true)
            .setMinLength(3)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('view')
        .setDescription('View your connected account.')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('disconnect')
        .setDescription('Disconnect your account.')
    ),
  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ flags:"Ephemeral" })
    
    if (sub === "view") {
      await accountView(client, interaction)
    } else if (sub === "disconnect") {
      await accountDisconnect(client, interaction)
    } else if (sub === "link") {
      await accountLink(client, interaction)
    }
  }
}