import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Check-in History controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should fetch user check-in history', async () => {
    const email = `history-user-${Date.now()}@example.com`

    // Register and authenticate
    await request(app.server).post('/users').send({
      name: 'History User',
      email,
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = authResponse.body

    // Create a gym
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `History Gym ${Date.now()}`,
        description: 'test gym',
        phone: null,
        latitude: -23.55052,
        longitude: -46.633308,
      })

    const gymsResponse = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'History Gym', page: 1 })

    const gymId = gymsResponse.body.gyms[0].id

    // Create a check-in
    await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .expect(201)

    // Fetch check-in history
    const historyResponse = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1 })
      .expect(200)

    expect(historyResponse.body.checkIns).toHaveLength(1)
    expect(historyResponse.body.checkIns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          gym_id: gymId,
        }),
      ]),
    )
  })

  it('should return 401 when fetching history without token', async () => {
    await request(app.server).get('/check-ins/history').expect(401)
  })
})
