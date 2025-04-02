const request = require('supertest');
const { app } = require('./setup');

describe('2. Wallet API Tests', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Wallet Test',
        email: 'wallet@test.com',
        password: 'password123'
      });
    authToken = res.body.token;
  });

  test('2.1 - Should get initial balance (0)', async () => {
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(res.body.data.balance).toBe(0);
  });

  test('2.2 - Should process deposit', async () => {
    await request(app)
      .post('/api/v1/wallet/deposit')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 500 })
      .expect(202);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.body.data.balance).toBe(500);
  });
});