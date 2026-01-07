import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { User } from 'generated/prisma/client'
import type { UsersRepository } from '@/repositories/users-repository'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourcesNotFoundError } from './errors/resources-not-found-error'

describe('GetUserProfileUseCase', () => {
  let userRepository: UsersRepository
  let sut: GetUserProfileUseCase

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
    } as unknown as UsersRepository
    sut = new GetUserProfileUseCase(userRepository)
  })

  it('should return user profile when user exists', async () => {
    const mockUser: User = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    } as unknown as User

    vi.mocked(userRepository.findById).mockResolvedValue(mockUser)

    const result = await sut.execute({ userId: 'user-123' })

    expect(result.user).toEqual(mockUser)
    expect(userRepository.findById).toHaveBeenCalledWith('user-123')
  })

  it('should throw ResourcesNotFoundError when user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null)

    await expect(sut.execute({ userId: 'invalid-id' })).rejects.toThrow(
      ResourcesNotFoundError,
    )
  })
})
