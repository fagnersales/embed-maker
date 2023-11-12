import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { z } from 'zod'

export const slash = new SlashCommandBuilder()
  .setName('image')
  .setDescription('Define uma nova imagem para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o URL da imagem, envie "x" para removê-la.')
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

  const oldImageUrl = creatingEmbed.builder.data.image
  const newImageUrl = interaction.options.getString('value', true)

  if (newImageUrl.toLowerCase() === "x") {
    creatingEmbed.builder.setImage(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Imagem removida com sucesso',
      fetchReply: true,
    }))
  }

  const { success } = z.string().url().safeParse(newImageUrl)

  if (!success) return void interaction.reply({
    content: 'O valor para URL da imagem precisa ser de um formato de URL.'
  })

  creatingEmbed.builder.setImage(newImageUrl)
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `URl da imagem alterada de: **${oldImageUrl}** para: **${newImageUrl}**`,
    fetchReply: true,
  }))
}