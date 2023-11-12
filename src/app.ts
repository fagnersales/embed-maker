import { Collection, Message } from 'discord.js'
import { CreatingEmbed } from './structures/CreatingEmbed'


export class App {
  public creatingEmbeds: Collection<Message['id'], CreatingEmbed> = new Collection()
}

export const app = new App()