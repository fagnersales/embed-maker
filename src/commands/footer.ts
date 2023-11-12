import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { z } from 'zod'

export const slash = new SlashCommandBuilder()
  .setName('footer')
  .setDescription('Define um novo footer para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o texto do footer, envie "x" para removê-lo.')
    .setRequired(true)
  )
  .addStringOption(builder => builder
    .setName('icon-url')
    .setDescription('Valor para o url de ícone do footer, envie "x" para removê-lo.')
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

  const oldFooter = creatingEmbed.builder.data.footer
  const oldFooterText = oldFooter?.text
  const newFooterText = interaction.options.getString('value', true)

  if (newFooterText.toLowerCase() === "x") {
    creatingEmbed.builder.setFooter(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Footer removido com sucesso',
      fetchReply: true,
    }))
  }

  const oldFooterIconUrl = oldFooter?.icon_url
  const newFooterIconUrl = interaction.options.getString('icon-url', false)

  if (newFooterIconUrl) {
    const { success } = z.string().url().safeParse(newFooterIconUrl)

    if (!success) return void interaction.reply({
      content: 'O valor para URL do ícone precisa ser de um formato de URL.'
    })
  }

  creatingEmbed.builder.setFooter({
    iconURL: newFooterIconUrl || oldFooterIconUrl || undefined,
    text: newFooterText
  })
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `Texto do footer alterado de: **${oldFooterText}** para: **${newFooterText}**`,
    fetchReply: true,
  }))
}