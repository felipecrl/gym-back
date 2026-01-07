import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Profile controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should get user profile with valid token', async () => {
    const email = `profile-user-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const { token } = authResponse.body

    const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(profileResponse.body.user).toEqual(
      expect.objectContaining({
        email,
      }),
    )
  })

  it('should return 401 when accessing profile without token', async () => {
    await request(app.server).get('/me').expect(401)
  })
})
