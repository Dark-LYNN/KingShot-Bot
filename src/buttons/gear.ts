import { ExtendedClient } from "@/types/extendedClient";
import { HeroesFile } from "@/types/hero.types";
import { capitalizeFirst, formatNumber } from "@/utils/formatting";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const rawData = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'data', 'heroes.json'), "utf-8");

export default {
  customId: (id: string): boolean => id.startsWith('gear-'),
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
      
      if (!hero.skills.gear) {
        await interaction.reply({ content: `❌ Hero **${heroKey}** Does not have any hero gear.`, flags: "Ephemeral" });
        return;
      }

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`heroInfo-${heroName}`)
            .setLabel("⮜ Go Back")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false),
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
        );
    
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle(`${hero.name} (Exclusive Gear)`)
        .setThumbnail(hero.image)
        .setDescription(
          '**Power:** ' + formatNumber(hero.skills.gear.HeroPower) + '\n' +
          '**Hero Attack:** ' + formatNumber(hero.skills.gear.HeroAttack) + '\n' +
          '**Hero Defense:** ' + formatNumber(hero.skills.gear.HeroDefense) + '\n' +
          '**Hero Health:** ' + formatNumber(hero.skills.gear.HeroHealth) + '\n' +
          '**Escort Health:** ' + formatNumber(hero.skills.gear.EscortAttack) + '\n' +
          '**Escort Health:** ' + formatNumber(hero.skills.gear.EscortDefense) + '\n' +
          '**Escort Health:** ' + formatNumber(hero.skills.gear.EscortHealth) + '\n' +
          '**' + capitalizeFirst(hero.class) + ' Lethality:** ' + hero.skills.gear.TroopLethality + '\n' +
          '**' + capitalizeFirst(hero.class) + ' Health:** ' + hero.skills.gear.TroopHealth + '\n\n' +
          hero.skills.gear.skills.map(
            (s: any, i: number) =>
            `**${i + 1}. ${s.name}**${s.description}\n*Upgrades:* ${s.upgrades.join(
              " → "
            )}`
          )
          .join("\n\n"),
        )
        .setFooter({ text: "Made with ❤️ by Lynnux" });
    
      await interaction.update({ embeds: [embed], components: [row]})
    } catch (err) {
      console.log(err)
    }
  }
}