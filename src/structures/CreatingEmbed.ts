import { EmbedData } from '../repositories/Embeds'
import { Message, User, EmbedBuilder } from 'discord.js'

export class CreatingEmbed {
  public message: Message
  public host: User
  public builder: EmbedBuilder
  public collecting: boolean = false
  public lastDescriptionMessage: Message | null = null
  public empty: boolean = true

  public constructor(props: { message: Message, host: User, builder?: EmbedBuilder }) {
    this.message = props.message
    this.host = props.host
    this.builder = props.builder || this.useEmptyEmbed()
  }

  public static embedFromEmbedData(embedData: EmbedData): EmbedBuilder {
    const embed = new EmbedBuilder()

    embed.setTitle(embedData.title)
    embed.setDescription(embedData.description)
    embed.setImage(embedData.image)
    embed.setThumbnail(embedData.thumbnail)
    embed.setColor(embedData.color)

    embed.setFooter(embedData.footer === null ? null : {
      text: embedData.footer.text,
      iconURL: embedData.footer.iconURL || undefined
    })
    embed.setAuthor(embedData.author === null ? null : {
      name: embedData.author.name,
      iconURL: embedData.author.iconURL || undefined,
      url: embedData.author.url || undefined
    })

    return embed
  }

  public useEmptyEmbed() {
    this.empty = true
    return new EmbedBuilder()
      .setTitle('Criando sua Embed...')
  }

  public toJSON(): EmbedData {
    const fieldOrNull = <T extends string | number>(str: T | undefined) => str ?? null

    const data = this.builder.data

    return {
      author: !data.author ? null : {
        name: data.author.name,
        iconURL: fieldOrNull(data.author.icon_url),
        url: fieldOrNull(data.author.url),
      },

      footer: !data.footer ? null : {
        text: data.footer.text,
        iconURL: fieldOrNull(data.footer.icon_url),
      },

      color: fieldOrNull(data.color),
      description: fieldOrNull(data.description),
      image: fieldOrNull(data.image?.url),
      thumbnail: fieldOrNull(data.thumbnail?.url),
      title: fieldOrNull(data.title)
    }
  }

  isEmpty(): boolean {
    if (this.builder.data.description) return (this.empty = false, false)
    if (this.builder.data.fields?.length) return (this.empty = false, false)
    if (this.builder.data.footer?.text) return (this.empty = false, false)
    if (this.builder.data.image) return (this.empty = false, false)
    if (this.builder.data.thumbnail) return (this.empty = false, false)
    if (this.builder.data.timestamp) return (this.empty = false, false)
    if (this.builder.data.title) return (this.empty = false, false)
    if (this.builder.data.author?.name) return (this.empty = false, false)

    return (this.empty = true, true)
  }

  async update(): Promise<void> {
    if (this.isEmpty()) this.builder = this.useEmptyEmbed()
    else {
      if (this.builder.data.title === 'Criando sua Embed...') this.builder.setTitle(null)
      if (this.isEmpty()) this.builder = this.useEmptyEmbed()
    }

    await this.message.edit({ embeds: [this.builder] })
  }
}