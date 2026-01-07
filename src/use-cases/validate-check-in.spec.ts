import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourcesNotFoundError } from './errors/resources-not-found-error'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import type { CheckIn } from 'generated/prisma/client'

describe('ValidateCheckInUseCase', () => {
  let validateCheckInUseCase: ValidateCheckInUseCase
  let checkInsRepository: CheckInsRepository

  beforeEach(() => {
    checkInsRepository = {
      findById: vi.fn(),
      save: vi.fn(),
    } as unknown as CheckInsRepository

    validateCheckInUseCase = new ValidateCheckInUseCase(checkInsRepository)
  })

  it('should validate a check-in', async () => {
    const checkIn: CheckIn = {
      id: 'check-in-1',
      user_id: 'user-1',
      gym_id: 'gym-1',
      validated_at: null,
      created_at: new Date(),
    } as CheckIn

    vi.mocked(checkInsRepository.findById).mockResolvedValue(checkIn)
    vi.mocked(checkInsRepository.save).mockResolvedValue(checkIn)

    const result = await validateCheckInUseCase.execute({
      checkInId: 'check-in-1',
    })

    expect(result.checkIn.validated_at).toEqual(expect.any(Date))
    expect(checkInsRepository.save).toHaveBeenCalled()
  })

  it('should throw ResourcesNotFoundError when check-in does not exist', async () => {
    vi.mocked(checkInsRepository.findById).mockResolvedValue(null)

    await expect(
      validateCheckInUseCase.execute({ checkInId: 'non-existent' }),
    ).rejects.toThrow(ResourcesNotFoundError)
  })

  it('should not validate a check-in after 20 minutes', async () => {
    const oldDate = new Date(Date.now() - 1000 * 60 * 21) // 21 minutes ago

    const checkIn: CheckIn = {
      id: 'check-in-2',
      user_id: 'user-1',
      gym_id: 'gym-1',
      validated_at: null,
      created_at: oldDate,
    } as CheckIn

    vi.mocked(checkInsRepository.findById).mockResolvedValue(checkIn)

    await expect(
      validateCheckInUseCase.execute({ checkInId: 'check-in-2' }),
    ).rejects.toThrow(LateCheckInValidationError)

    expect(checkInsRepository.save).not.toHaveBeenCalled()
  })
})
