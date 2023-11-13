import { ChannelType, ChatInputCommandInteraction, Collection, Message, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { once } from 'events'

export const slash = new SlashCommandBuilder()
  .setName('text')
  .setDescription('Adicione um texto para a mensagem da Embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para o text, envie "x" para removê-lo ou "a" para utilizar uma mensagem normal.')
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

  if (creatingEmbed.collecting) return void interaction.reply({
    content: 'Envie uma mensagem normal para que seja coletada.'
  })

  const oldText = creatingEmbed.content
  const newText = interaction.options.getString('value', true)

  if (newText.toLowerCase() === "x") {
    creatingEmbed.content = null
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Texto removido com sucesso',
      fetchReply: true,
    }))
  }

  if (newText.toLowerCase() === "a") {
    creatingEmbed.collecting = true
    const promptMessage = await interaction.reply({
      fetchReply: true,
      content: 'Envie uma mensagem para ser coletada e utilizada como texto.'
    })

    const collector = interaction.channel.createMessageCollector({
      time: 300_000,
      max: 1,
      filter: message => message.content.length > 0
    })

    const [collected, reason] = await once(collector, 'end') as [Collection<string, Message>, string]

    if (reason === 'time') {
      return void promptMessage.edit('Coletor cancelado por ausência.')
    }

    const collectedMessage = collected.first()

    if (!collectedMessage) return void promptMessage.edit('Algo deu errado.')

    collectedMessage.react('🔁')

    creatingEmbed.content = collectedMessage.content
    creatingEmbed.lastTextMessage = collectedMessage
    creatingEmbed.collecting = false
    creatingEmbed.update()

    promptMessage.delete().catch(() => { })

    return void sleepAndDelete(interaction.channel.send({
      content: 'Texto alterado com sucesso! Caso você edite a mensagem, ela será refletida no texto.'
    }))
  }

  creatingEmbed.content = newText
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `Texto alterado de: **${oldText}** para: **${newText}**`,
    fetchReply: true,
  }))
}