import { ChannelType, ChatInputCommandInteraction, ColorResolvable, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'

export const slash = new SlashCommandBuilder()
  .setName('color')
  .setDescription('Define uma nova cor para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para a embed, envie "x" para removê-lo.')
    .setRequired(true)
  )

export const executer = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.inCachedGuild() || interaction.channel?.type !== ChannelType.GuildText) {
    return void interaction.reply({
      content: 'Algo deu errado',
      ephemeral: true
    })
  }

  const creatingEmbed = app.creatingEmbeds.find(embed => embed.host.id === interaction.user.id)

  if (!creatingEmbed) return void interaction.reply({
    content: `Você precisa começar a criar uma embed. Utilize \`/criar\` antes.`
  })

  const oldColor = creatingEmbed.builder.data.color
  const newColor = interaction.options.getString('value', true)
  
  if (newColor.toLowerCase() === "x") {
    creatingEmbed.builder.setColor(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Cor removida com sucesso',
      fetchReply: true,
    }))
  }

  try {
    creatingEmbed.builder.setColor(
      newColor.startsWith("#") ? newColor as ColorResolvable : `#${newColor}`
    )

    creatingEmbed.update()

    sleepAndDelete(interaction.reply({
      content: `Cor alterada de: ${oldColor} para: ${newColor}`,
      fetchReply: true,
    }))
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('color')) {
      creatingEmbed.builder.setColor(oldColor ?? null)
      return void sleepAndDelete(interaction.reply({
        content: `Falha ao alterar a cor.`,
        fetchReply: true,
      }))
    }

    throw error
  }
}