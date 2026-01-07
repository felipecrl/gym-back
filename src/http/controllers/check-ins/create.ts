import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeCheckInUseCase } from '@/use-cases/factories/make-check-in-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInsParamsSchema = z.object({
    gymId: z.uuid(),
  })

  const createCheckInBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return value >= -90 && value <= 90
    }, 'Latitude must be between -90 and 90'),
    longitude: z.number().refine((value) => {
      return value >= -180 && value <= 180
    }, 'Longitude must be between -180 and 180'),
  })

  const { gymId } = createCheckInsParamsSchema.parse(request.params)

  const { latitude, longitude } = createCheckInBodySchema.parse(request.body)

  const createCheckInUseCase = makeCheckInUseCase()

  await createCheckInUseCase.execute({
    gymId,
    userId: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send()
}
