import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { CreatingEmbed } from '../structures/CreatingEmbed'

export const slash = new SlashCommandBuilder()
  .setName('reenviar')
  .setDescription('Reenvie sua embed')

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

  const message = await interaction.reply({
    fetchReply: true,
    content: creatingEmbed.content ?? undefined,
    embeds: [creatingEmbed.builder]
  })

  app.creatingEmbeds.delete(creatingEmbed.message.id)
  app.creatingEmbeds.set(message.id, new CreatingEmbed({
    host: interaction.user,
    message,
    content: creatingEmbed.content,
    builder: creatingEmbed.builder
  }))
}