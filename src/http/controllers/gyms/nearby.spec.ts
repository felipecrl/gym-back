import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Nearby Gyms controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should fetch gyms near the provided coordinates', async () => {
    const email = `nearby-user-${Date.now()}@example.com`

    // Register user and authenticate
    await request(app.server).post('/users').send({
      name: 'Nearby User',
      email,
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = authResponse.body

    // Create a near gym (São Paulo center-ish)
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Near Gym',
        description: 'close by',
        phone: null,
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .expect(201)

    // Create a far gym (Rio de Janeiro)
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Far Gym',
        description: 'far away',
        phone: null,
        latitude: -22.9068467,
        longitude: -43.1728965,
      })
      .expect(201)

    // Query nearby gyms around São Paulo
    const res = await request(app.server)
      .get('/gyms/nearby')
      .set('Authorization', `Bearer ${token}`)
      .query({ latitude: -23.55052, longitude: -46.633308 })
      .expect(200)

    expect(res.body.gyms).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: 'Near Gym' })]),
    )
  })
})
