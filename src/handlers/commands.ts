import { AutocompleteInteraction } from 'discord.js'
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import fs from 'fs'
import path from 'path'

type Command = {
  slash: SlashCommandBuilder
  executer: (interaction: ChatInputCommandInteraction) => Promise<any>
  autoComplete?: (interaction: AutocompleteInteraction) => Promise<any>
}

export const commands: Command[] = []

const initialPath = fs.existsSync(path.join(__dirname, '..', 'commands')) ? path.join(__dirname, '..', 'commands') : path.join(__dirname, 'commands')

readFolder(initialPath)

function readFolder(dirPath: string) {
  const files = fs.readdirSync(dirPath)

  for (const file of files) {
    readFile(path.join(dirPath, file))
  }
}

function readFile(filePath: string) {
  const file = fs.lstatSync(filePath)

  if (file.isFile()) {
    const data = require(filePath)

    if (data.slash && data.executer) commands.push(data)
  }

  if (file.isDirectory()) {
    readFolder(filePath)
  }
}