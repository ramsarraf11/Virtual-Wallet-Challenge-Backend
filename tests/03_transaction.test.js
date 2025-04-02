const request = require('supertest');
const { app } = require('./setup');

describe('3. Transaction API Tests', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Transaction Test',
        email: 'transactions@test.com',
        password: 'password123'
      });
    authToken = res.body.token;

    await request(app)
      .post('/api/v1/wallet/deposit')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 1000 });
    
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('3.1 - Should return transaction history', async () => {
    const res = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].amount).toBe(1000);
  });
});