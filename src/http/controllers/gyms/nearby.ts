import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeFetchNearbyGymsUseCase } from '@/use-cases/factories/make-fetch-nearby-gyms-use-case'

export async function nearby(request: FastifyRequest, reply: FastifyReply) {
  const nearbyGymsQuerySchema = {
    latitude: z.coerce
      .number()
      .refine(
        (value) => value >= -90 && value <= 90,
        'Latitude must be between -90 and 90',
      ),
    longitude: z.coerce
      .number()
      .refine(
        (value) => value >= -180 && value <= 180,
        'Longitude must be between -180 and 180',
      ),
  }

  const { latitude, longitude } = z
    .object(nearbyGymsQuerySchema)
    .parse(request.query)

  const fetchNearbyGymsUseCase = makeFetchNearbyGymsUseCase()

  const { gyms } = await fetchNearbyGymsUseCase.execute({
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(200).send({ gyms })
}
