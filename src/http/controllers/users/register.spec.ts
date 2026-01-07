import { beforeAll, afterAll, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Register controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should register a new user and return 201', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: `test-user-${Date.now()}@example.com`,
        password: '123456',
      })
      .expect(201)
  })

  it('should not allow registering with an existing email (409)', async () => {
    const email = `existing-${Date.now()}@example.com`

    // first register
    await request(app.server).post('/users').send({
      name: 'Existing User',
      email,
      password: '123456',
    })

    // second register with same email
    await request(app.server)
      .post('/users')
      .send({
        name: 'Existing User',
        email,
        password: '123456',
      })
      .expect(409)
  })
})
