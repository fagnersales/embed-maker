import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { z } from 'zod'

export const slash = new SlashCommandBuilder()
  .setName('author')
  .setDescription('Define um novo author para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o texto do author, envie "x" para removê-lo.')
    .setRequired(true)
  )
  .addStringOption(builder => builder
    .setName('icon-url')
    .setDescription('Valor para o url de ícone do author, envie "x" para removê-lo.')
    .setRequired(false)
  )
  .addStringOption(builder => builder
    .setName('url')
    .setDescription('Valor para o url do author, envie "x" para removê-lo.')
    .setRequired(false)
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

  const oldAuthor = creatingEmbed.builder.data.author

  const oldAuthorText = oldAuthor?.name
  const newAuthorText = interaction.options.getString('value', true)

  const oldAuthorIconUrl = oldAuthor?.icon_url
  const newAuthorIconUrl = interaction.options.getString('icon-url', false)

  const oldAuthorUrl = oldAuthor?.url
  const newAuthorUrl = interaction.options.getString('url', false)

  if (newAuthorIconUrl) {
    const { success } = z.string().url().safeParse(newAuthorIconUrl)

    if (!success) return void interaction.reply({
      content: 'O valor para URL do ícone precisa ser de um formato de URL.'
    })
  }

  if (newAuthorUrl) {
    const { success } = z.string().url().safeParse(newAuthorUrl)

    if (!success) return void interaction.reply({
      content: 'O valor para URL precisa ser de um formato de URL.'
    })
  }

  creatingEmbed.builder.setAuthor({
    url: newAuthorUrl || oldAuthorUrl || undefined,
    iconURL: newAuthorIconUrl || oldAuthorIconUrl || undefined,
    name: newAuthorText
  })
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `Texto do author alterado de: **${oldAuthorText}** para: **${newAuthorText}**`,
    fetchReply: true,
  }))
}