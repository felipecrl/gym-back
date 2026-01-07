import { prisma } from '@/lib/prisma'
import { Prisma, type CheckIn } from 'generated/prisma/client'
import type { CheckInsRepository } from '../check-ins-repository'

export class PrismaCheckInsRepository implements CheckInsRepository {
  async save(checkIn: CheckIn): Promise<CheckIn> {
    return await prisma.checkIn.update({
      where: {
        id: checkIn.id,
      },
      data: {
        validated_at: checkIn.validated_at,
      },
    })
  }

  async findById(id: string): Promise<CheckIn | null> {
    return await prisma.checkIn.findUnique({
      where: {
        id,
      },
    })
  }

  async countByUserId(userId: string): Promise<number> {
    const count = await prisma.checkIn.count({
      where: {
        user_id: userId,
      },
    })

    return count
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return await prisma.checkIn.findMany({
      where: {
        user_id: userId,
      },
      take: 20,
      skip: (page - 1) * 20,
    })
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = await prisma.checkIn.create({
      data,
    })

    return checkIn
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })
  }
}
