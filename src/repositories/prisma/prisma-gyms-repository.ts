import { prisma } from '@/lib/prisma'
import { type Gym } from 'generated/prisma/client'
import type { FindManyNearbyParams, GymsRepository } from '../gyms-repository'
import type { GymCreateInput } from 'generated/prisma/models'

export class PrismaGymsRepository implements GymsRepository {
  async findManyNearby(params: FindManyNearbyParams): Promise<Gym[]> {
    const { latitude, longitude } = params

    const gyms = await prisma.$queryRaw<Gym[]>`
      SELECT * FROM gyms
      WHERE
        (6371 * acos(
          cos(radians(${latitude})) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) *
          sin(radians(latitude))
        )) <= 10
    `

    return gyms
  }

  async searchMany(query: string, page: number): Promise<Gym[]> {
    return await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      skip: (page - 1) * 20,
      take: 20,
    })
  }

  async create(data: GymCreateInput): Promise<Gym> {
    const gym = await prisma.gym.create({
      data,
    })

    return gym
  }

  async findById(id: string): Promise<Gym | null> {
    return await prisma.gym.findUnique({
      where: {
        id,
      },
    })
  }
}
