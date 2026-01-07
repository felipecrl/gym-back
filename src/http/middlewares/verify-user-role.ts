import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FastifyJWT } from '@fastify/jwt'
import { prisma } from '@/lib/prisma'

export function verifyUserRole(roleToVerify: 'ADMIN' | 'MEMBER') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    let { role, sub } = request.user as FastifyJWT['user']

    if (!role && sub) {
      const user = await prisma.user.findUnique({ where: { id: sub } })
      role = user?.role as typeof role
    }

    if (role !== roleToVerify) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }
}
