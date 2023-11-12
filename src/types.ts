import type { ClientEvents } from 'discord.js'

export type EventExecuter<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => Promise<any> | any