import { Client, Collection, ClientOptions } from 'discord.js';
import { Command } from './commands';
import { Button } from './buttons';
import { Modal } from './modal';
import { logger } from '@/utils';
import path from 'path';
import { readFileSync } from 'fs';


/**
 * An extended Discord client with collections for commands, buttons, modals, etcetera.
 */
export class ExtendedClient extends Client<true> {
  readonly commands: Collection<string, Command>;
  readonly subcommands: Collection<string, Command>;
  readonly buttons: Collection<string, Button>;
  readonly modals: Collection<string, Modal>;
  private emojiMap: Record<string, string> = {};

  /**
   * Creates a new ExtendedClient instance.
   * @param {ClientOptions} options - Discord.js client options.
   */
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.subcommands = new Collection();
    this.buttons = new Collection();
    this.modals = new Collection();

    this.loadEmojis();
  }

  /**
   * Gets an environment variable.
   * @param {string} key - The environment variable name.
   * @param {string} [defaultValue=''] - Optional default value.
   * @returns {string} The environment variable value or the default.
   */
  env(key: string, defaultValue: string = ''): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
      logger.warn(`Environment variable ${key} is not set`);
    }
    return value;
  }

  private loadEmojis() {
    try {
      const emojiFile = path.join(__dirname, '../../public/emotes.json');
      const raw = readFileSync(emojiFile, 'utf-8');
      this.emojiMap = JSON.parse(raw);
      logger.info(`Loaded ${Object.keys(this.emojiMap).length} emojis`);
    } catch (err) {
      logger.error('Failed to load emojis.json', err);
    }
  }
  
  
  /**
   * Gets a custom emoji by name.
   * @param name The emoji key from the JSON
   */
  emoji(name: string): string {
    return this.emojiMap[name] ?? '';
  }
}
