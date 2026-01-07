import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Gym } from 'generated/prisma/client'
import type { GymsRepository } from '@/repositories/gyms-repository'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

describe('FetchNearbyGymsUseCase', () => {
  let gymRepository: GymsRepository
  let sut: FetchNearbyGymsUseCase

  beforeEach(() => {
    gymRepository = {
      findManyNearby: vi.fn() as unknown as GymsRepository['findManyNearby'],
      findById: vi.fn() as unknown as GymsRepository['findById'],
      searchMany: vi.fn() as unknown as GymsRepository['searchMany'],
      create: vi.fn() as unknown as GymsRepository['create'],
    }

    sut = new FetchNearbyGymsUseCase(gymRepository)
  })

  it('should be able to fetch nearby gyms', async () => {
    const mockGyms = [
      {
        id: '1',
        title: 'Gym 1',
        description: null,
        phone: null,
        latitude: { toNumber: () => -23.5505 },
        longitude: { toNumber: () => -46.6333 },
        created_at: new Date(),
      },
      {
        id: '2',
        title: 'Gym 2',
        description: null,
        phone: null,
        latitude: { toNumber: () => -23.5506 },
        longitude: { toNumber: () => -46.6334 },
        created_at: new Date(),
      },
    ] as unknown as Gym[]

    vi.mocked(gymRepository.findManyNearby).mockResolvedValueOnce(mockGyms)

    const result = await sut.execute({
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(result.gyms).toEqual(mockGyms)
    expect(gymRepository.findManyNearby).toHaveBeenCalledWith({
      latitude: -23.5505,
      longitude: -46.6333,
    })
  })

  it('should return empty array when no gyms are found', async () => {
    vi.mocked(gymRepository.findManyNearby).mockResolvedValueOnce([] as Gym[])

    const result = await sut.execute({
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(result.gyms).toEqual([])
  })
})
