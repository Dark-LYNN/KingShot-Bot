import { chromium } from 'playwright';
import { ApplicationIntegrationType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
import db from '@/database';
import { makeSign } from '@/utils/api';
import { fetchUser } from '@/database/functions';

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
    const userInfo = await fetchUser(user.id)
    
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

    const message = await redeemCode(fid, code);
    console.log(message)

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

async function redeemCode(fid: number, code: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://ks-giftcode.centurygame.com/', { waitUntil: 'networkidle' });

  // Step 1: enter Player ID
  await page.fill('input[placeholder="Player ID"]', fid.toString());
  
  // Step 2: wait for login button to be enabled and click it
  await page.waitForSelector('.login_btn:not(.disabled)');
  await page.click('.login_btn');
  
  // Step 3: wait for gift code input to appear (after login)
  await page.waitForSelector('input[placeholder="Enter Gift Code"]:not([disabled])');
  
  // Step 4: enter the gift code
  await page.fill('input[placeholder="Enter Gift Code"]', code);
  
  // Step 5: wait for exchange button to become enabled
  await page.waitForSelector('.exchange_btn:not(.disabled)');
  
  // Step 6: click exchange button
  await page.click('.exchange_btn:not(.disabled)');
  
  // Step 7: wait for modal and grab message
  await page.waitForSelector('.modal_content .msg');
  const message = await page.$eval('.modal_content .msg', el => el.textContent?.trim() || '');

  await browser.close();
  return message;
}
