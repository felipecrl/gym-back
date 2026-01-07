import type { CheckIn } from 'generated/prisma/client'
import type { CheckInsRepository } from '@/repositories/check-ins-repository'
import { ResourcesNotFoundError } from './errors/resources-not-found-error'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error'

interface ValidateCheckInUseCaseRequest {
  checkInId: string
}

interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn
}

export class ValidateCheckInUseCase {
  constructor(private checkInRepository: CheckInsRepository) {}

  async execute({
    checkInId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.findById(checkInId)

    if (!checkIn) {
      throw new ResourcesNotFoundError()
    }

    const distanceInMinutesFromCheckInCreation =
      (new Date().getTime() - checkIn.created_at.getTime()) / 1000 / 60

    if (distanceInMinutesFromCheckInCreation > 20) {
      throw new LateCheckInValidationError()
    }

    checkIn.validated_at = new Date()

    await this.checkInRepository.save(checkIn)
    return { checkIn }
  }
}
