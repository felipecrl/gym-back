import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Authenticate controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should authenticate with valid credentials', async () => {
    const email = `auth-user-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
      password: '123456',
    })

    const response = await request(app.server)
      .post('/sessions')
      .send({
        email,
        password: '123456',
      })
      .expect(200)

    expect(response.body).toEqual({
      token: expect.any(String),
    })
  })

  it('should not authenticate with wrong password', async () => {
    const email = `wrong-pass-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
      password: '123456',
    })

    await request(app.server)
      .post('/sessions')
      .send({
        email,
        password: 'wrong-password',
      })
      .expect(400)
  })

  it('should not authenticate with non-existent email', async () => {
    await request(app.server)
      .post('/sessions')
      .send({
        email: `non-existent-${Date.now()}@example.com`,
        password: '123456',
      })
      .expect(400)
  })
})
