import { chromium } from 'playwright';
import { ApplicationIntegrationType, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient } from '../../types/extendedClient';
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

    const fid = userInfo.fid.toString()
    const code = interaction.options.getString('code')?.toUpperCase()
    if (!code) { await interaction.editReply({ content: ':x: Code not found.' }); return; }

    const message = await redeemCode(fid, code);
    const embed = new EmbedBuilder()
      .setFooter({ text: 'Made with ❤️ by Lynnux' });


    if (message === "Redeemed, please claim the rewards in your mail!") {
      embed
        .setTitle('Code Redeemed')
        .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
        .setDescription(
          'The gift-code **' + code + '** has been redeemed on ' + userInfo.username + ' from #' + userInfo.state + '\n' +
          '-# *Rewards will be directly sent to Character’s mail after redemption'
        )
    } else {
      embed
        .setColor(parseInt('#FF3333'.replace(/^#/, ''), 16))
        .setTitle('Code Couldn\'t be redeemed')
        .setDescription(message)
    }
    
    if (userInfo.avatar_url) {
      embed.setThumbnail(userInfo.avatar_url)
    }

    await interaction.editReply({ embeds: [embed] })
  }
}

async function redeemCode(fid: string, code: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://ks-giftcode.centurygame.com/', { waitUntil: 'networkidle' });

    // Step 1: enter Player ID
    const fidStr = fid
    const playerInput = page.locator('input[placeholder="Player ID"]');

    // Set value and dispatch input event so site detects it
    await playerInput.evaluate((el, val) => {
      const input = el as HTMLInputElement;
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, fidStr);

    // Optional: also fill normally to mimic typing
    await playerInput.fill(fidStr);

    const currentValue = await playerInput.evaluate((el) => (el as HTMLInputElement).value);

    // Step 2: wait for login button to be enabled and click it
    const loginBtn = page.locator('.login_btn:not(.disabled)');
    await loginBtn.waitFor({ state: 'visible', timeout: 15000 });
    await loginBtn.click();

    // Wait a bit for server to process login
    await page.waitForTimeout(1000);

    // Step 3: wait for gift code input to be enabled
    const codeInput = page.locator('input[placeholder="Enter Gift Code"]');
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector<HTMLInputElement>(selector);
        return el && !el.disabled;
      },
      'input[placeholder="Enter Gift Code"]',
      { timeout: 20000 }
    );    

    // Step 4: fill gift code
    await codeInput.fill(code);

    await page.waitForTimeout(1000);

    // Step 5: click exchange button
    const exchangeBtn = page.locator('.exchange_btn');
    await exchangeBtn.click({ force: true });

    // Step 6: wait for modal message
    const modalMsg = page.locator('.modal_content .msg');
    await modalMsg.waitFor({ state: 'visible', timeout: 15000 });
    const message = await modalMsg.textContent();

    // Step 7: log localStorage
    const localStorageData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) data[key] = localStorage.getItem(key) as string;
      }
      return data;
    });

    return message?.trim() || 'No message found';
    
  } finally {
    await browser.close();
  }
}
