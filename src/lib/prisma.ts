import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'
import { env } from '@/env'

const connectionString = env.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['query'] : [],
})

export { prisma }
