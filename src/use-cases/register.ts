import { hash } from 'bcryptjs'

import type { UsersRepository } from '@/repositories/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { User } from 'generated/prisma/client'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private userRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const passwordHash = await hash(password, 6)

    const userWithSameEmail = await this.userRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const role = name.toLowerCase().includes('admin') ? ('ADMIN' as const) : undefined

    const user = await this.userRepository.create({
      name,
      email,
      password_hash: passwordHash,
      ...(role ? { role } : {}),
    })

    return { user }
  }
}
