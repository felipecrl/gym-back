import type { User } from 'generated/prisma/client'
import type { UsersRepository } from '@/repositories/users-repository'
import { ResourcesNotFoundError } from './errors/resources-not-found-error'

interface GetUserProfileUseCaseRequest {
  userId: string
}

interface GetUserProfileUseCaseResponse {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private userRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourcesNotFoundError()
    }

    return { user }
  }
}
