import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'

export const slash = new SlashCommandBuilder()
  .setName('title')
  .setDescription('Define um novo título para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o título, envie "x" para removê-lo.')
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

  const oldTitle = creatingEmbed.builder.data.title
  const newTitle = interaction.options.getString('value', true)

  if (newTitle.toLowerCase() === "x") {
    creatingEmbed.builder.setTitle(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Título removido com sucesso',
      fetchReply: true,
    }))
  }

  creatingEmbed.builder.setTitle(newTitle)
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `Título alterado de: **${oldTitle}** para: **${newTitle}**`,
    fetchReply: true,
  }))
}