const request = require('supertest');
const { app } = require('./setup');

describe('4. Concurrency Tests', () => {
  let authToken;
  const CONCURRENT_CALLS = 10;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Concurrency Test',
        email: 'concurrency@test.com',
        password: 'password123'
      });
    authToken = res.body.token;
  });

  test('4.1 - Should handle concurrent deposits', async () => {
    const requests = Array(CONCURRENT_CALLS).fill().map(() => 
      request(app)
        .post('/api/v1/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 10 })
    );

    const responses = await Promise.all(requests);
    responses.forEach(res => {
      expect(res.status).toBe(202);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.body.data.balance).toBe(CONCURRENT_CALLS * 10);
  });
});