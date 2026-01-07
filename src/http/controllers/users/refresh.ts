import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FastifyJWT } from '@fastify/jwt'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify({ onlyCookie: true })
  } catch (err) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const { role, sub } = request.user as FastifyJWT['user']

  const token = await reply.jwtSign({ role }, { sign: { sub } })
  const refreshToken = await reply.jwtSign(
    { role },
    { sign: { sub, expiresIn: '7d' } },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({ token })
}
