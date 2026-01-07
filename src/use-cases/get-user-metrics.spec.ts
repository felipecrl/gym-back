import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GetUserMetricsUseCase } from './get-user-metrics'

let checkInsRepository: CheckInsRepository
let sut: GetUserMetricsUseCase

describe('GetUserMetricsUseCase', () => {
  beforeEach(() => {
    checkInsRepository = {
      countByUserId: vi.fn(),
    } as unknown as CheckInsRepository
    sut = new GetUserMetricsUseCase(checkInsRepository)
  })

  it('should be able to get user check ins count', async () => {
    vi.mocked(checkInsRepository.countByUserId).mockResolvedValueOnce(5)

    const result = await sut.execute({ userId: 'user-123' })

    expect(result.checkInsCount).toBe(5)
    expect(checkInsRepository.countByUserId).toHaveBeenCalledWith('user-123')
  })

  it('should return 0 when user has no check ins', async () => {
    vi.mocked(checkInsRepository.countByUserId).mockResolvedValueOnce(0)

    const result = await sut.execute({ userId: 'user-456' })

    expect(result.checkInsCount).toBe(0)
  })
})
