import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeCreateGymUseCase } from '@/use-cases/factories/make-create-gym-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = {
    title: z.string(),
    description: z.string().nullable(),
    phone: z.string().nullable(),
    latitude: z.number().refine((value) => {
      return value >= -90 && value <= 90
    }, 'Latitude must be between -90 and 90'),
    longitude: z.number().refine((value) => {
      return value >= -180 && value <= 180
    }, 'Longitude must be between -180 and 180'),
  }

  const { title, description, phone, latitude, longitude } = z
    .object(createBodySchema)
    .parse(request.body)

  const createGymUseCase = makeCreateGymUseCase()

  await createGymUseCase.execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  })

  return reply.status(201).send()
}
