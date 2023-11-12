import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { CreatingEmbed } from '../structures/CreatingEmbed'

export const slash = new SlashCommandBuilder()
  .setName('criar')
  .setDescription('Comece a criar uma nova embed')

export const executer = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.inCachedGuild() || interaction.channel?.type !== ChannelType.GuildText) {
    return void interaction.reply({
      content: 'Algo deu errado',
      ephemeral: true
    })
  }

  console.log(interaction.user.id, app.creatingEmbeds.first()?.host.id)

  const creatingEmbed = app.creatingEmbeds.find(embed => embed.host.id === interaction.user.id)

  if (creatingEmbed) return void interaction.reply({
    content: `Você já está criando uma embed. Cancele-a para criar uma nova ou [clique aqui](${creatingEmbed.message.url}) para ir até ela`
  })

  const builder = new EmbedBuilder()
    .setTitle('Criando sua Embed...')

  const message = await interaction.reply({
    fetchReply: true,
    embeds: [builder]
  })

  console.log(interaction.user)

  app.creatingEmbeds.set(message.id, new CreatingEmbed({
    message,
    builder,
    host: interaction.user
  }))
}