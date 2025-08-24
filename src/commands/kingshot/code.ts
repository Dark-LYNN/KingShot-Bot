import { chromium } from 'playwright';
import { ApplicationIntegrationType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
import db from '@/database';
import { makeSign } from '@/utils/api';

type ApiResponse = {
  code: 1,           // code = 1 already claimed 0 = success
  data: [],          // Seems to always be empty!
  err_code: number,  // 40011 = already claimed on other account 40008 = already redeemed 2000 = success
  msg: string,       // "SAME TYPE EXCHANGE." = already claimed 
}

export default {
  data: new SlashCommandBuilder()
    .setName('code')
    .setDescription('Redeem a code.')
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The code to redeem.')
        .setRequired(true)
        .setMinLength(3)
    ),
  async execute(
    _client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
  ):Promise<void> {
    await interaction.deferReply({ flags:"Ephemeral" })

    const user = interaction.user;
    const userInfo = await db
      .selectFrom('users')
      .where('user_id', '=', user.id)
      .selectAll()
      .executeTakeFirst();
    
    if (!userInfo) {
      await interaction.editReply({ content: ':x: You don\'t seem to have an account linked. Please link a account with </account link:1408600312851333191> ' });
      return;
    };

    const fid = parseInt(interaction.options.getString('id') ?? '0', 10);
    const currentTime = Date.now();
    const code = interaction.options.getString('code')?.toUpperCase()
    const captcha = ""
    if (!code) { await interaction.editReply({ content: ':x: Code not found.' }); return; }
    const sign = makeSign({
      fid,
      cdk: code,
      captcha_code: captcha,
      time: currentTime
    });
    const data = `sign=${sign}&fid=${fid}&cdk=${code}&captcha_code=&time=${currentTime}`;

    const json = await redeemCode(fid, code, sign, currentTime);

    if (json.err_code == 40007) {
      await interaction.editReply({ content: ":x: This code seems to be expired." })
      return;
    } else if (json.err_code == 40014) {
      await interaction.editReply({ content: ":x: This code seems to be invalid." })
      return;
    } else if (json.err_code == 40011) {
      await interaction.editReply({ content: ":x: This code seems to be already claimed on another Character on same user account." })
      return;
    } else if (json.err_code == 40008 ) {
      await interaction.editReply({ content: ":x: This code seems to be already claimed." })
      return;
    } else if (json.err_code != 20000) {
      await interaction.editReply({ content: ":x: Something seems wrong. We got error code: " + json.err_code })
      console.log('Message:'+ json.msg + '\n' + 'code:' + json.code + '\n' + 'Err Code:' + json.err_code + '\n' + 'Data:' + json.data )
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Code Redeemed')
      .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
      .setDescription(
        'The gift-code **' + code + '** has been redeemed on ' + userInfo.username + ' from #' + userInfo.state + '\n' +
        '**Rewards will be directly sent to Character’s mail after redemption*'
      )
      .setFooter({ text: 'Made with ❤️ by Lynnux' });
    
    if (userInfo.avatar_url) {
      embed.setThumbnail(userInfo.avatar_url)
    }

    await interaction.editReply({ embeds: [embed] })
  }
}

async function redeemCode(fid: number, code: string, sign: string, currentTime: number) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // get rum_device_id
  await page.goto('https://ks-giftcode.centurygame.com/');

  // take rum_device_id from localStorage
  const rumDeviceId = await page.evaluate(() => localStorage.getItem('rum_device_id'));

  if (!rumDeviceId) {
    await browser.close();
    throw new Error('Failed to get rum_device_id');
  }

  // make POST req from browser
  const result = await page.evaluate(
    async ({ fid, code, sign, time }) => {
      const res = await fetch('https://kingshot-giftcode.centurygame.com/api/gift_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `fid=${fid}&cdk=${code}&sign=${sign}&captcha_code=&time=${time}`
      });
      return res.json();
    },
    { fid, code, sign, time: currentTime }
  );

  await browser.close();
  return result;
}
