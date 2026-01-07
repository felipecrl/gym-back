import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as bcrypt from 'bcryptjs'
import { AuthenticateUseCase } from './authenticate'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import type { UsersRepository } from '@/repositories/users-repository'
import type { User } from 'generated/prisma/client'

let usersRepository: UsersRepository
let authenticateUseCase: AuthenticateUseCase

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: '$2a$12$K5X5Z5Z5Z5Z5Z5Z5Z5Z5ZOK5X5X5X5X5X5X5X5X5X5X5X5X5X5X5',
  created_at: new Date(),
  role: 'MEMBER',
}

describe('AuthenticateUseCase', () => {
  vi.mock('bcryptjs', () => ({ compare: vi.fn() }))
  beforeEach(() => {
    usersRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    }
    authenticateUseCase = new AuthenticateUseCase(usersRepository)
  })

  it('should authenticate a user with valid credentials', async () => {
    const compareSpy = vi.spyOn(bcrypt, 'compare') as ReturnType<
      typeof vi.spyOn
    >
    compareSpy.mockResolvedValue(true)
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(mockUser)

    const response = await authenticateUseCase.execute({
      email: 'john@example.com',
      password: 'password123',
    })

    expect(response.user).toEqual(mockUser)
  })

  it('should throw InvalidCredentialsError when user is not found', async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(null)

    await expect(
      authenticateUseCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('should throw InvalidCredentialsError when password does not match', async () => {
    vi.mocked(usersRepository.findByEmail).mockResolvedValue(mockUser)
    const compareSpy = vi.spyOn(bcrypt, 'compare') as ReturnType<
      typeof vi.spyOn
    >
    compareSpy.mockResolvedValue(false)

    await expect(
      authenticateUseCase.execute({
        email: 'john@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
