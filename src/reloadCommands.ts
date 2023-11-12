import { REST, Routes } from 'discord.js'
import { env } from './env'
import { commands } from './handlers/commands'

export const reloadCommands = async () => {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_CLIENT_TOKEN)

  const body = {
    body: commands.map(command => command.slash.toJSON())
  }

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), body)
  .then(() => console.log(`Done with ${body.body.length} commands`))
}