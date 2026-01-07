import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import type { CheckIn } from 'generated/prisma/client'
import { FetchUserCheckInHistoryUseCase } from './fetch-user-check-ins-history'

describe('FetchUserCheckInHistoryUseCase', () => {
  let checkInsRepository: CheckInsRepository
  let sut: FetchUserCheckInHistoryUseCase

  beforeEach(() => {
    checkInsRepository = {
      findManyByUserId: vi.fn(),
    } as unknown as CheckInsRepository

    sut = new FetchUserCheckInHistoryUseCase(checkInsRepository)
  })

  it('should fetch check-in history by user id', async () => {
    const mockCheckIns: CheckIn[] = [
      {
        id: '1',
        user_id: 'user-1',
        gym_id: 'gym-1',
        validated_at: new Date(),
        created_at: new Date(),
      } as CheckIn,
    ]

    vi.spyOn(checkInsRepository, 'findManyByUserId').mockResolvedValueOnce(
      mockCheckIns,
    )

    const result = await sut.execute({ userId: 'user-1', page: 1 })

    expect(result.checkIns).toEqual(mockCheckIns)
    expect(checkInsRepository.findManyByUserId).toHaveBeenCalledWith(
      'user-1',
      1,
    )
    expect(checkInsRepository.findManyByUserId).toHaveBeenCalledTimes(1)
  })

  it('should return empty array when user has no check-ins', async () => {
    vi.spyOn(checkInsRepository, 'findManyByUserId').mockResolvedValueOnce(
      [] as CheckIn[],
    )

    const result = await sut.execute({ userId: 'user-1', page: 1 })

    expect(result.checkIns).toEqual([])
    expect(checkInsRepository.findManyByUserId).toHaveBeenCalledWith(
      'user-1',
      1,
    )
  })
})
