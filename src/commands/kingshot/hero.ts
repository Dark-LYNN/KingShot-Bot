import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
import { heroInfo } from './_HeroInfo';
import fs from "fs";
import path from "path";
import { HeroesFile } from '@/types/hero.types';


const rawData = fs.readFileSync(path.join(__dirname, "..", "..", "..", "public", "data", "heroes.json"),"utf-8");
const heroes: HeroesFile = JSON.parse(rawData);
const heroChoices = heroes.flatMap((entry) => {
  const key = Object.keys(entry)[0];
  if (!key) return [];

  const hero = entry[key];
  if (!hero || typeof hero.name !== "string") return [];
  const name = hero.name.trim();
  if (!name || name.length > 100) return [];

  return [{ name, value: key }];
});

export default {
  data: new SlashCommandBuilder()
    .setName('hero')
    .setDescription('Hero')
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addSubcommand(subcommand =>
      subcommand.setName('info')
        .setDescription('Get Hero info')
        .addStringOption(option =>
          option.setName('hero')
            .setDescription('Which hero to get info on?')
            .setRequired(true)
            .setMinLength(3)
            .addChoices(...heroChoices)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('compare')
        .setDescription('Compare two heroes with each-other.')
        .addStringOption(option =>
            option.setName('hero-one')
              .setDescription('First hero to compare to the second')
              .setRequired(true)
          )
        .addStringOption(option =>
            option.setName('hero-two')
              .setDescription('Second hero to compare with the first')
              .setRequired(true)
          )
    ),
  async execute(
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ flags:"Ephemeral" })
    
    if (sub === "info") {
      await heroInfo(client, interaction);
    }
  }
}