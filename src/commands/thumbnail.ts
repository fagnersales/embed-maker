import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { z } from 'zod'

export const slash = new SlashCommandBuilder()
  .setName('thumbnail')
  .setDescription('Define uma nova thumbnail para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o URL da thumbnail, envie "x" para removê-la.')
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

  const oldThumbnailUrl = creatingEmbed.builder.data.thumbnail
  const newThumbnailUrl = interaction.options.getString('value', true)

  if (newThumbnailUrl.toLowerCase() === "x") {
    creatingEmbed.builder.setThumbnail(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Thumbnail removida com sucesso',
      fetchReply: true,
    }))
  }

  const { success } = z.string().url().safeParse(newThumbnailUrl)

  if (!success) return void interaction.reply({
    content: 'O valor para URL da thumbnail precisa ser de um formato de URL.'
  })

  creatingEmbed.builder.setThumbnail(newThumbnailUrl)
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `URl da thumbnail alterada de: **${oldThumbnailUrl}** para: **${newThumbnailUrl}**`,
    fetchReply: true,
  }))
}