import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CheckIn } from 'generated/prisma/client'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import type { GymsRepository } from '@/repositories/gyms-repository'
import { CheckInUseCase } from './check-in'

describe('CheckInUseCase', () => {
  let checkInRepository: CheckInsRepository
  let sut: CheckInUseCase
  let gymRepository: GymsRepository

  beforeEach(() => {
    checkInRepository = {
      create: vi.fn() as unknown as CheckInsRepository['create'],
      findByUserIdOnDate:
        vi.fn() as unknown as CheckInsRepository['findByUserIdOnDate'],
      findManyByUserId:
        vi.fn() as unknown as CheckInsRepository['findManyByUserId'],
      countByUserId: vi.fn() as unknown as CheckInsRepository['countByUserId'],
      findById: vi.fn() as unknown as CheckInsRepository['findById'],
      save: vi.fn() as unknown as CheckInsRepository['save'],
    }

    gymRepository = {
      findById: vi.fn() as unknown as GymsRepository['findById'],
      create: vi.fn() as unknown as GymsRepository['create'],
      searchMany: vi.fn() as unknown as GymsRepository['searchMany'],
      findManyNearby: vi.fn() as unknown as GymsRepository['findManyNearby'],
    }

    sut = new CheckInUseCase(checkInRepository, gymRepository)
  })

  it('should be able to check in', async () => {
    const mockCheckIn: CheckIn = {
      id: '1',
      user_id: 'user-123',
      gym_id: 'gym-123',
      created_at: new Date(),
    } as CheckIn

    vi.mocked(checkInRepository.findByUserIdOnDate).mockResolvedValueOnce(null)
    vi.mocked(checkInRepository.create).mockResolvedValueOnce(mockCheckIn)

    const mockGym = {
      id: 'gym-123',
      title: 'Gym',
      description: null,
      phone: null,
      latitude: { toNumber: () => 0 },
      longitude: { toNumber: () => 0 },
      created_at: new Date(),
    } as unknown as import('generated/prisma/client').Gym

    vi.mocked(gymRepository.findById).mockResolvedValueOnce(mockGym)

    const result = await sut.execute({
      userId: 'user-123',
      gymId: 'gym-123',
    })

    expect(result.checkIn).toEqual(mockCheckIn)
    expect(checkInRepository.create).toHaveBeenCalledWith({
      user_id: 'user-123',
      gym_id: 'gym-123',
    })
  })
})
