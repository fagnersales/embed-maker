import { Message } from 'discord.js'

export const sleepAndDelete = (message: Promise<Message>) => message.then(msg => new Promise(resolve => setTimeout(resolve, 5_000)).then(() => msg.delete().catch(() => { })))