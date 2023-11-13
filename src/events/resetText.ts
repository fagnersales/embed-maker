import { Events } from 'discord.js'
import type { EventExecuter } from '../types'
import { app } from '../app'

export const eventName = 'messageUpdate' as const

export const executer: EventExecuter<typeof eventName> = (_, newMessage) => {
  const creatingEmbed = app.creatingEmbeds.find(creatingEmbed => creatingEmbed.lastTextMessage?.id === newMessage.id)

  if (!creatingEmbed) return

  creatingEmbed.content = newMessage.content
  creatingEmbed.update()
}