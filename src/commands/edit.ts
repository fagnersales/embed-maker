import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { app } from '../app'
import { EmbedsRepository } from '../repositories/Embeds'
import { AutocompleteInteraction } from 'discord.js'
import { CreatingEmbed } from '../structures/CreatingEmbed'

export const slash = new SlashCommandBuilder()
  .setName('editar')
  .setDescription('Edite uma embed salva ou enviada no chat')
  .addStringOption(builder => builder
    .setName('name')
    .setDescription('Nome da Embed')
    .setRequired(false)
    .setAutocomplete(true)
  )
  .addStringOption(builder => builder
    .setName('url')
    .setDescription('URL da mensagem com Embed')
    .setRequired(false)
  )

export const autoComplete = async (interaction: AutocompleteInteraction) => {
  const embedsRepository = new EmbedsRepository()

  const userEmbeds = await embedsRepository.getAll(interaction.user.id)

  interaction.respond(userEmbeds.map(userEmbed =>
    ({ name: userEmbed.name, value: userEmbed.id })
  ))
}

export const executer = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.inCachedGuild() || interaction.channel?.type !== ChannelType.GuildText) {
    return void interaction.reply({
      content: 'Algo deu errado',
      ephemeral: true
    })
  }

  const alreadyCreatingEmbed = app.creatingEmbeds.find(embed => embed.host.id === interaction.user.id)

  if (alreadyCreatingEmbed) return void interaction.reply({
    content: 'Você não pode fazer isto enquanto cria uma embed.'
  })

  const embedId = interaction.options.getString('name', false)
  const messageUrl = interaction.options.getString('url', false)

  if (!embedId && !messageUrl) return void interaction.reply({
    content: 'Você precisa preencher uma das opções.'
  })

  if (messageUrl) return void interaction.reply('Fiz isso ainda não.')

  const message = await interaction.deferReply({ fetchReply: true })

  const embedsRepository = new EmbedsRepository()

  const userEmbeds = await embedsRepository.getAll(interaction.user.id)

  const userEmbed = userEmbeds.find(userEmbed => userEmbed.id === embedId)

  if (!userEmbed) return void interaction.editReply('Embed não encontrada!')

  const embed = CreatingEmbed.embedFromEmbedData(userEmbed.data)

  app.creatingEmbeds.set(message.id, new CreatingEmbed({
    host: interaction.user,
    message,
    builder: embed,
    content: userEmbed.data.content
  }))

  await interaction.editReply({
    embeds: [embed],
    content: userEmbed.data.content ?? undefined
  })
}