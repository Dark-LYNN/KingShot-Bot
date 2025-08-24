import { ExtendedClient } from "@/types/extendedClient";
import { HeroesFile } from "@/types/hero.types";
import { capitalizeFirst } from "@/utils/formatting";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const rawData = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'data', 'heroes.json'), "utf-8");

export default {
  customId: (id: string): boolean => id.startsWith('heroInfo-'),
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
        await interaction.editReply({ content: `❌ Hero **${heroKey}** not found.` });
        return;
      }
    
      const hero = heroEntry[heroKey];
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('expedition-' + hero.name.toLowerCase())
            .setLabel("Expedition")
            .setEmoji('🧭')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId('conquest-' + hero.name.toLowerCase())
            .setLabel("Conquest")
            .setEmoji('⚔️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false),    
        )
    
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
        .setTitle(`${hero.name} (${hero.class})`)
        .setThumbnail(hero.image)
        .setDescription(
          '**Description:** ' + hero.description + '\n\n' +
          '**Class:** ' + ((hero.class === 'archer') ? '🏹' : ((hero.class === 'cavalry') ? '🐴': '⚔️')) + ` ${hero.class}` + '\n' +
          '**Generation:** ' + ((hero.generation === 3) ? '3️⃣' : ((hero.generation === 2) ? '2️⃣' : '1️⃣' )) + '\n' +
          '**Obtained trough:** \n`' + hero.sources.join("`, `") + '`'
        )
        .setFooter({ text: "Made with ❤️ by Lynnux" });
    
      await interaction.update({ embeds: [embed], components: [row]})
    } catch (err) {
      console.log(err)
    }
  }
}