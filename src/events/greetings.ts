import type { EventExecuter } from '../types'

export const eventName = 'ready' as const

export const executer: EventExecuter<typeof eventName> = (client) => {
  console.log(`Client is ready! ${client.user.username}`)
  client.user.setActivity('Ajudando com patrocínios!')
}