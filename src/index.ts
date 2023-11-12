import { env } from './env'
import { makeClient } from './client'
import { commands } from './handlers/commands'
import { events } from './handlers/events'
import { reloadCommands } from './reloadCommands'
import './database/connect'

const client = makeClient()

events.forEach(event => client.on(event.eventName, event.executer))

client.on('interactionCreate', interaction => {
  if (interaction.isChatInputCommand()) {
    const command = commands.find(command => command.slash.name === interaction.commandName)
    if (command) return void command.executer(interaction)
  }

  if (interaction.isAutocomplete()) {
    const command = commands.find(command => command.slash.name === interaction.commandName)
    if (command?.autoComplete) return void command.autoComplete(interaction)
  }
})

reloadCommands()

client.login(env.DISCORD_CLIENT_TOKEN)