import { beforeAll, afterAll, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Create Check-in controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create a check-in when user is near the gym', async () => {
    const email = `checkin-user-${Date.now()}@example.com`

    // Register and authenticate user
    await request(app.server).post('/users').send({
      name: 'Check-in User',
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
        title: 'Near Gym',
        description: 'test gym',
        phone: null,
        latitude: -23.55052,
        longitude: -46.633308,
      })

    // Extract gym ID from response or create manually
    // Since the gym create endpoint returns 201, we need to search for it
    const gymsResponse = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'Near Gym', page: 1 })

    const gymId = gymsResponse.body.gyms[0].id

    // Create check-in at the same location as the gym
    await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .expect(201)
  })

  it('should return 401 when creating check-in without token', async () => {
    const gymId = '123e4567-e89b-12d3-a456-426614174000'

    await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .send({
        latitude: -23.55052,
        longitude: -46.633308,
      })
      .expect(401)
  })
})
