import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Search Gyms controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should search gyms by query (authenticated)', async () => {
    const email = `search-user-${Date.now()}@example.com`

    // Register and authenticate a user
    await request(app.server).post('/users').send({
      name: 'Search User',
      email,
      password: '123456',
    })

    const auth = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = auth.body

    // Create some gyms
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Rocket Gym',
        description: 'best gym',
        phone: null,
        latitude: -23.55,
        longitude: -46.63,
      })
      .expect(201)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Node Fitness',
        description: 'nice place',
        phone: null,
        latitude: -23.56,
        longitude: -46.64,
      })
      .expect(201)

    // Search by query
    const res = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ query: 'Rocket', page: 1 })
      .expect(200)

    expect(res.body.gyms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Rocket Gym' }),
      ]),
    )
  })

  it('should return 400 when query is missing', async () => {
    const email = `search-missing-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'Search Missing',
      email,
      password: '123456',
    })

    const auth = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = auth.body

    await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1 })
      .expect(400)
  })
})
