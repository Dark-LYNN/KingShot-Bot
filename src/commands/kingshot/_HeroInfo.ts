import { ExtendedClient } from "@/types/extendedClient";
import { HeroesFile } from "@/types/hero.types";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const rawData = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'public', 'data', 'heroes.json'), "utf-8");

export async function heroInfo(
  _client:ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  const heroes: HeroesFile = JSON.parse(rawData);
  const heroKey = interaction.options.getString("hero", true).toLowerCase();
  console.log(heroKey)
  const heroEntry = heroes.find((h) => Object.keys(h)[0] === heroKey);

  if (!heroEntry) {
    await interaction.editReply({ content: `❌ Hero **${heroKey}** not found.` });
    return;
  }
  
  const hero = heroEntry[heroKey];

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

    await interaction.editReply({embeds: [embed], components: [row.toJSON()]})
}