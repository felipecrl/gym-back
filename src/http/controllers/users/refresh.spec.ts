import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Refresh controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should refresh token when refresh cookie is valid', async () => {
    const email = `refresh-user-${Date.now()}@example.com`

    await request(app.server).post('/users').send({
      name: 'Refresh User',
      email,
      password: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password: '123456',
    })

    const setCookieHeader = authResponse.get('set-cookie')
    const refreshCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader.find((c) => c.startsWith('refreshToken='))
      : setCookieHeader

    const response = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', refreshCookie || '')
      .expect(200)

    expect(response.body).toHaveProperty('token')
    expect(response.get('set-cookie')).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    )
  })

  it('should return 401 when no refresh cookie is provided', async () => {
    await request(app.server).patch('/token/refresh').expect(401)
  })
})
