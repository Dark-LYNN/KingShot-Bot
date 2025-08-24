import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { ExtendedClient } from './extendedClient';

export type InteractionHandler<I extends Interaction> = {
  customId: string | ((id: string) => boolean);
  execute(client: ExtendedClient, interaction: I): Promise<void>;
};

export type SlashHandler<I extends ChatInputCommandInteraction> = {
  data: string | ((id: string) => boolean);
  execute(client: ExtendedClient, interaction: I): Promise<void>;
};