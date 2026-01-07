import { expect, test, describe, beforeEach, vi } from 'vitest'
import { RegisterUseCase } from './register'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { UsersRepository } from '@/repositories/users-repository'

describe('RegisterUseCase', () => {
  let registerService: RegisterUseCase
  let userRepository: UsersRepository

  beforeEach(() => {
    userRepository = {
      findById: vi.fn() as unknown as UsersRepository['findById'],
      findByEmail: vi.fn() as unknown as UsersRepository['findByEmail'],
      create: vi.fn() as unknown as UsersRepository['create'],
    }

    registerService = new RegisterUseCase(userRepository)
  })

  test('should register a new user successfully', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null)

    await registerService.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com')
    expect(userRepository.create).toHaveBeenCalledOnce()
  })

  test('should throw UserAlreadyExistsError if email already exists', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValueOnce({
      id: '1',
      name: 'Existing User',
      email: 'john@example.com',
      password_hash: 'hash',
      created_at: new Date(),
      role: 'MEMBER',
    })

    await expect(
      registerService.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UserAlreadyExistsError)

    expect(userRepository.create).not.toHaveBeenCalled()
  })
})
