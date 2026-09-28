import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const API = 'http://localhost:5000/api/v1';

describe('Auth', () => {
  const email = `test-${Date.now()}@university.edu`;

  it('registers a new user', async () => {
    const res = await request(API).post('/auth/register').send({
      name: 'Test User', email, password: 'TestPass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects weak password', async () => {
    const res = await request(API).post('/auth/register').send({
      name: 'X', email: 'bad@university.edu', password: 'weak',
    });
    expect(res.status).toBe(422);
  });

  it('logs in', async () => {
    const res = await request(API).post('/auth/login').send({ email, password: 'TestPass123' });
    expect(res.status).toBe(200);
  });
});