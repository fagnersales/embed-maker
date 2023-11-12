import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder, Collection, Message } from 'discord.js'
import { app } from '../app'
import { sleepAndDelete } from '../utils/sleepAndDelete'
import { once } from 'events'

export const slash = new SlashCommandBuilder()
  .setName('description')
  .setDescription('Define uma nova descrição para sua embed')
  .addStringOption(builder => builder
    .setName('value')
    .setDescription('Valor para a embed, envie "x" para removê-lo ou envie "a" para utilizar sua próxima mensagem.')
    .setRequired(true)
  )

export const executer = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.inCachedGuild() || interaction.channel?.type !== ChannelType.GuildText) {
    return void interaction.reply({
      content: 'Algo deu errado',
      ephemeral: true
    })
  }

  console.log(interaction.user.id, app.creatingEmbeds.first()?.host.id)

  const creatingEmbed = app.creatingEmbeds.find(embed => embed.host.id === interaction.user.id)

  if (!creatingEmbed) return void interaction.reply({
    content: `Você precisa começar a criar uma embed. Utilize \`/criar\` antes.`
  })

  if (creatingEmbed.collecting) return void interaction.reply({
    content: 'Envie uma mensagem normal para que seja coletada.'
  })

  const oldDescription = creatingEmbed.builder.data.description
  const newDescription = interaction.options.getString('value', true)

  if (newDescription.toLowerCase() === "x") {
    creatingEmbed.builder.setDescription(null)
    creatingEmbed.update()

    return void sleepAndDelete(interaction.reply({
      content: 'Descrição removida com sucesso',
      fetchReply: true,
    }))
  }

  if (newDescription.toLowerCase() === "a") {
    creatingEmbed.collecting = true
    const promptMessage = await interaction.reply({
      fetchReply: true,
      content: 'Envie uma mensagem para ser coletada e utilizada na descrição.'
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

    creatingEmbed.builder.setDescription(collectedMessage.content)
    creatingEmbed.lastDescriptionMessage = collectedMessage
    creatingEmbed.collecting = false
    creatingEmbed.update()

    promptMessage.delete().catch(() => { })

    return void sleepAndDelete(interaction.channel.send({
      content: 'Descrição alterada com sucesso! Caso você edite a mensagem, ela será refletida na descrição.'
    }))
  }

  creatingEmbed.builder.setDescription(newDescription)
  creatingEmbed.update()

  sleepAndDelete(interaction.reply({
    content: `Descrição alterado de: ${oldDescription} para: ${newDescription}`,
    fetchReply: true,
  }))
}