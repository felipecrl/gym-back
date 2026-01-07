import { describe, it, expect, vi } from 'vitest'
import type { Gym } from 'generated/prisma/client'
import type { GymsRepository } from '@/repositories/gyms-repository'
import { CreateGymUseCase } from './create-gym'

describe('CreateGymUseCase', () => {
  it('should create a gym with valid data', async () => {
    const mockGym = {
      id: '1',
      title: 'Gym Test',
      description: 'A test gym',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
      created_at: new Date(),
    } as unknown as Gym

    const mockGymsRepository: GymsRepository = {
      create: vi.fn().mockResolvedValue(mockGym),
    } as unknown as GymsRepository

    const createGymUseCase = new CreateGymUseCase(mockGymsRepository)

    const result = await createGymUseCase.execute({
      title: 'Gym Test',
      description: 'A test gym',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(result.gym).toEqual(mockGym)
    expect(mockGymsRepository.create).toHaveBeenCalledWith({
      title: 'Gym Test',
      description: 'A test gym',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
    })
  })

  it('should create a gym with null description and phone', async () => {
    const mockGym = {
      id: '2',
      title: 'Gym Test 2',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
      created_at: new Date(),
    } as unknown as Gym

    const mockGymsRepository: GymsRepository = {
      create: vi.fn().mockResolvedValue(mockGym),
    } as unknown as GymsRepository

    const createGymUseCase = new CreateGymUseCase(mockGymsRepository)

    const result = await createGymUseCase.execute({
      title: 'Gym Test 2',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
    })

    expect(result.gym).toEqual(mockGym)
  })
})
