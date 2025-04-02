const request = require('supertest');
const { app } = require('./setup');
const User = require('../models/User');

describe('1. Auth API Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  test('1.1 - Should register new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);
    
    expect(res.body.token).toBeDefined();
    expect(res.body.walletId).toBeDefined();
  });

  test('1.2 - Should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);
    
    expect(res.body.token).toBeDefined();
  });
});