import { prisma } from '@/lib/prisma'
import { Prisma, type User } from 'generated/prisma/client'
import type { Role } from 'generated/prisma/enums'
import type { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const existingUsers = await prisma.user.count()

    const roleValue: Role = existingUsers === 0 ? 'ADMIN' : ((data as Prisma.UserCreateInput & { role?: Role }).role ?? 'MEMBER')

    const createData: Prisma.UserCreateInput & { role: Role } = {
      ...data,
      role: roleValue,
    }

    const user = await prisma.user.create({
      data: createData,
    })

    return user
  }
}
