import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { EmbedsRepository } from '../repositories/Embeds'

export const slash = new SlashCommandBuilder()
  .setName('finalizar')
  .setDescription('Finalize e salve a embed com um nome')
  .addStringOption(builder => builder
    .setName('name')
    .setDescription('Nome da Embed')
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

  if (creatingEmbed.empty) return void interaction.reply('A embed está vazia.')

  const name = interaction.options.getString('name', false)

  if (name) {
    await interaction.deferReply()

    const embedsRepository = new EmbedsRepository()

    const userEmbeds = await embedsRepository.getAll(interaction.user.id)

    if (userEmbeds.some(userEmbed => userEmbed.name.toLowerCase() === name.toLowerCase())) {
      return void interaction.editReply('Este nome já está sendo utilizado.')
    }

    await embedsRepository.add({
      data: creatingEmbed.toJSON(),
      ownerId: interaction.user.id,
      name: name.toLowerCase()
    })

    app.creatingEmbeds.delete(creatingEmbed.message.id)

    await interaction.editReply(`Embed salva com o nome de \`${name}\`! A embed também será reenviada.`)

    return void interaction.channel.send({ embeds: [creatingEmbed.builder] })
  }

  app.creatingEmbeds.delete(creatingEmbed.message.id)

  await interaction.reply('Embed finalizada com sucesso!')

  return void interaction.channel.send({
    embeds: [creatingEmbed.builder],
    content: creatingEmbed.content ?? undefined
  })
}