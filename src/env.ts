import { z } from 'zod'
import 'dotenv/config'

export const env = z.object({
  DISCORD_CLIENT_ID: z.string().min(1, "Missing .env property 'DISCORD_CLIENT_ID'"),
  DISCORD_CLIENT_TOKEN: z.string().min(1, "Missing .env property 'DISCORD_CLIENT_TOKEN'"),
}).parse(process.env)