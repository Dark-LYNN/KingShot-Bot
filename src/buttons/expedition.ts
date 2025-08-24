import { ExtendedClient } from "@/types/extendedClient";
import { HeroesFile } from "@/types/hero.types";
import { capitalizeFirst } from "@/utils/formatting";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const rawData = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'data', 'heroes.json'), "utf-8");

export default {
  customId: (id: string): boolean => id.startsWith('expedition-'),
  async execute(
    _client: ExtendedClient,
    interaction: ButtonInteraction,
  ):Promise<void> {
    try {
      const [, heroName] = interaction.customId.split("-");

      const heroes: HeroesFile = JSON.parse(rawData);
      const heroKey = heroName
      const heroEntry = heroes.find((h) => Object.keys(h)[0] === heroKey);

      if (!heroEntry) {
        await interaction.reply({ content: `❌ Hero **${heroKey}** not found.`, flags: "Ephemeral" });
        return;
      }
    
      const hero = heroEntry[heroKey];
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`heroInfo-${heroName}`)
            .setLabel("⮜ Go Back")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false),
        
          new ButtonBuilder()
            .setCustomId(`conquest-${heroName}`)
            .setLabel("Conquest")
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false)
        );

      if (hero.type === "SSR") {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId('gear-' + hero.name.toLowerCase())
            .setLabel("Exclusive Gear")
            .setEmoji('🛡️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false)
        )
      }
  
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`${hero.name} (Expedition)`)
        .setThumbnail(hero.image)
        .setDescription(
          '**' + capitalizeFirst(hero.class) + ' Attack:** ' + hero.skills.expedition.Attack + '\n' +
          '**' + capitalizeFirst(hero.class) + ' Defense:** ' + hero.skills.expedition.Defense + '\n' +
          hero.skills.expedition.skills
            .map(
              (s: any, i: number) =>
              `**${i + 1}. ${s.name}**${s.description}\n*Upgrades:* ${s.upgrades.join(
                " → "
              )}`
            )
            .join("\n\n"),      )
        .setFooter({ text: "Made with ❤️ by Lynnux" });

      await interaction.update({ embeds: [embed], components: [row]})
    } catch (err) {
      console.log(err)
    }
  }
}