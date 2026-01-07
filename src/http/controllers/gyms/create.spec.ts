import { beforeAll, afterAll, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Create Gym controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create a gym when authenticated', async () => {
    const email = `gym-user-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'Gym Admin',
      email,
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = authResponse.body

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Awesome Gym',
        description: 'Top-tier equipment',
        phone: '555-0101',
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .expect(201)
  })

  it('should return 401 when creating a gym without token', async () => {
    await request(app.server)
      .post('/gyms')
      .send({
        title: 'Unauthorized Gym',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
      })
      .expect(401)
  })
})
