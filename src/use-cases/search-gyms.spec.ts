import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchGymsUseCase } from './search-gyms'
import type { GymsRepository } from '@/repositories/gyms-repository'
import type { Gym } from 'generated/prisma/client'

describe('SearchGymsUseCase', () => {
  let gymsRepository: GymsRepository
  let searchGymsUseCase: SearchGymsUseCase

  beforeEach(() => {
    gymsRepository = {
      searchMany: vi.fn(),
    } as unknown as GymsRepository

    searchGymsUseCase = new SearchGymsUseCase(gymsRepository)
  })

  it('should be able to search gyms by query', async () => {
    const mockGyms = [
      {
        id: '1',
        title: 'Gym 1',
        description: 'Test gym',
        phone: '123',
        latitude: { toNumber: () => 0 },
        longitude: { toNumber: () => 0 },
        created_at: new Date(),
      },
    ] as unknown as Gym[]

    vi.spyOn(gymsRepository, 'searchMany').mockResolvedValue(mockGyms)

    const result = await searchGymsUseCase.execute({
      query: 'test',
      page: 1,
    })

    expect(result.gyms).toEqual(mockGyms)
    expect(gymsRepository.searchMany).toHaveBeenCalledWith('test', 1)
  })

  it('should return empty list when no gyms are found', async () => {
    vi.spyOn(gymsRepository, 'searchMany').mockResolvedValue([] as Gym[])

    const result = await searchGymsUseCase.execute({
      query: 'nonexistent',
      page: 1,
    })

    expect(result.gyms).toEqual([])
    expect(result.gyms).toHaveLength(0)
  })

  it('should pass correct page parameter to repository', async () => {
    vi.spyOn(gymsRepository, 'searchMany').mockResolvedValue([] as Gym[])

    await searchGymsUseCase.execute({
      query: 'gym',
      page: 5,
    })

    expect(gymsRepository.searchMany).toHaveBeenCalledWith('gym', 5)
  })
})
