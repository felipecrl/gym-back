import { beforeAll, afterAll, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Validate Check-in controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should validate a check-in', async () => {
    const email = `validate-user-${Date.now()}@example.com`

    // Register and authenticate
    await request(app.server).post('/users').send({
      name: 'Validate User',
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
        title: `Validate Gym ${Date.now()}`,
        description: 'test gym',
        phone: null,
        latitude: -23.55052,
        longitude: -46.633308,
      })

    const gymsResponse = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'Validate Gym', page: 1 })

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

    // Get the check-in ID from history
    const historyResponse = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1 })

    const checkInId = historyResponse.body.checkIns[0].id

    // Validate the check-in
    await request(app.server)
      .patch(`/check-ins/${checkInId}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })

  it('should return 401 when validating check-in without token', async () => {
    const checkInId = '123e4567-e89b-12d3-a456-426614174000'

    await request(app.server)
      .patch(`/check-ins/${checkInId}/validate`)
      .expect(401)
  })
})
