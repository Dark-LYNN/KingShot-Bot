import { ExtendedClient } from "@/types/extendedClient";
import { petsFile } from "@/types/hero.types";
import { ApplicationIntegrationType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const rawData = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'public', 'data', 'pets.json'), "utf-8");
const pets: petsFile = JSON.parse(rawData);

const petChoices = pets.flatMap((entry) => {
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
    .setName('pet')
    .setDescription('Pet info')
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addSubcommand(subcommand =>
      subcommand.setName('info')
        .setDescription('Show info on a pet.')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('The pets name')
            .setRequired(true)
            .setMinLength(3)
            .addChoices(...petChoices)
        )
    ),
  async execute(
    _client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ flags:"Ephemeral" })
    
    if (sub === "info") {
      const name = interaction.options.getString("name", true).toLowerCase();

      const entry = pets.find((e) => Object.keys(e)[0].toLowerCase() === name);
      if (!entry) {
        await interaction.editReply("❌ Pet not found.");
        return;
      }

      const [id, pet] = Object.entries(entry)[0];

      const embed = new EmbedBuilder()
        .setTitle(`${pet.name} (Gen ${pet.generation})`)
        .setThumbnail(pet.icon)
        .setDescription(pet.description)
        .addFields({ name: `🐾 ${pet.skill.title}`, value: pet.skill.description });

      if (pet.skill.upgrades?.length) {
        embed.addFields({
          name: "🔼 Skill Upgrades",
          value: pet.skill.upgrades.join(" → "),
        });
      }  

      if (pet.skill.extra?.rewards?.length) {
        embed.addFields({
          name: "🎁 Rewards",
          value: pet.skill.extra.rewards.join(", "),
        });
      }

      await interaction.editReply({ embeds: [embed] });
    }
  }
}