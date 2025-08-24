import { ExtendedClient } from "@/types/extendedClient";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ForumChannel, TextChannel, ChannelType, ThreadChannel } from "discord.js";

export default {
  guilds: ['1329845200847114320'],
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test command with buttons"),
  async execute(
    _client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ) {
    const channel = interaction.channel;
    
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread)) {
      await interaction.reply({
        ephemeral: true,
        content: ":x: Cannot do that here (must be a text or thread channel)."
      });
      return;
    }

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("farmed-two")
          .setLabel("Farmed")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(false),
      
        new ButtonBuilder()
          .setCustomId("farmable-two")
          .setLabel("farmable")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      ).toJSON();

    const embed = new EmbedBuilder()
      .setTitle("END FARM TWO")
      .setDescription("**Username:** [end]END_FARM_ONE\n**Can be farmed:** True")
      .addFields(
        {
          name: "Resources:",
          value: "<:Bread:1407349904606756934> Bread: NaN\n<:Wood:1407349664906477750> Wood: NaN\n<:Stone:1407350022193807662> Stone: NaN\n<:Iron:1407349744421830851> Iron: NaN",
          inline: false
        },
      )
      .setThumbnail("https://cdn.lynnux.xyz/images/1755609704273.png")
      .setColor("#f58f00")
      .setFooter({
        text: "Bot made with ❤️ by Lynnux.",
      });

    await (channel as TextChannel | ThreadChannel).send({
      embeds: [embed],
      components: [row1]
    });
    await interaction.reply({ content: "✅ Application created!", flags: 'Ephemeral' });
  }
}