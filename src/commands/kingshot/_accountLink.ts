import { upsertUser } from "@/database/functions";
import { ExtendedClient } from "@/types/extendedClient";
import { makeSign } from "@/utils/api";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import https from 'https';
import { URL } from 'url';

export type ApiResponse = {
  code: number;       // Status Code
  data: {
    fid: number,      // UserID
    nickname: string, // UserName
    kid: number,      // KingdomID
    stove_lv: number, // Level
    stove_lv_content: number,
    avatar_image: string; // UserAvatar
    total_recharge_amount: number
  },
  msg: string;        // Status Message
  err_code: string;   // Error Code
}

const url = new URL('https://kingshot-giftcode.centurygame.com/api/player');
const options: https.RequestOptions = {
  method: 'POST',
  headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://ks-giftcode.centurygame.com',
      'Priority': 'u=1, i',
      'Referer': 'https://ks-giftcode.centurygame.com/',
      'Sec-CH-UA': '"Not)A;Brand";v="8", "Chromium";v="138", "Lynnux";v="138"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Linux"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Sec-GPC': '1',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  },
};

export async function accountLink(
  _client: ExtendedClient,
  interaction: ChatInputCommandInteraction
) {
  try {
    const fid = parseInt(interaction.options.getString('id') ?? '0', 10);
    const currentTime = Date.now();
    const sign = makeSign({
      fid,
      time: currentTime
    });
    const data = `sign=${sign}&fid=${fid}&time=${currentTime}`;

    const json = await postData(data);

    if (json.msg !== 'success') {
      await interaction.editReply({ content: ":x: Your request does not seem right, please try again later." })
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(parseInt('#FFEB3B'.replace(/^#/, ''), 16))
      .setTitle('Profile Linked: ' + json.data.nickname)
      .setDescription(
        '**Username:** ' + json.data.nickname + '\n' +
        '**Town Center Level:** ' + json.data.stove_lv + '\n' +
        '**Kingdom:** #' + json.data.kid
      )
      .setFooter({ text: "Made with ❤️ by Lynnux" });
    
    if (json.data.avatar_image) {
      embed.setThumbnail(json.data.avatar_image)
    }
    
    await interaction.editReply({ embeds: [embed] });

    await upsertUser(interaction.user.id, json.data);
    
  } catch (err) {
    if (err instanceof Error) {
      console.log('Error: ' + err.message)
      console.log('Error Stack: ' + err.stack)
    } else {
      console.log(err)
    }
    await interaction.editReply({ content: ":x: Something went wrong when making this request, please try again later." })
  }
}


function postData(data: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let result = '';

      res.on('data', (chunk) => result += chunk);
      res.on('end', () => {
        try {
          const json: ApiResponse = JSON.parse(result);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
