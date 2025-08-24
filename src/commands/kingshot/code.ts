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
  const page = await browser.newPage();

  try {
    await page.goto('https://ks-giftcode.centurygame.com/', { waitUntil: 'networkidle' });

    // Step 1: enter Player ID
    const playerInput = page.locator('input[placeholder="Player ID"]');
    await playerInput.fill(fid.toString());

    // Step 2: wait for login button to be enabled and click it
    const loginBtn = page.locator('.login_btn:not(.disabled)');
    await loginBtn.waitFor({ state: 'visible', timeout: 15000 });
    await loginBtn.click();

    await page.waitForTimeout(1000);

    // Step 3: wait for gift code input to be enabled
    const codeInput = page.locator('input[placeholder="Enter Gift Code"]');
    await codeInput.waitFor({ state: 'visible', timeout: 20000 });

    // Step 4: fill gift code
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector<HTMLInputElement>(selector);
        return el && !el.disabled;
      },
      'input[placeholder="Enter Gift Code"]',
      { timeout: 20000 }
    );    
    await codeInput.fill(code);

    await page.waitForTimeout(1000);
    
    // Step 5: click exchange button
    const exchangeBtn = page.locator('.exchange_btn');
    await exchangeBtn.click({ force: true });

    // Step 6: wait for modal message
    const modalMsg = page.locator('.modal_content .msg');
    await modalMsg.waitFor({ state: 'visible', timeout: 15000 });
    const message = await modalMsg.textContent();

    const localStorageData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data[key] = localStorage.getItem(key) as string;
      }
      return data;
    });
    
    console.log('LocalStorage:', localStorageData);
    
    return message?.trim() || 'No message found';
    
  } finally {
    await browser.close();
  }
}
