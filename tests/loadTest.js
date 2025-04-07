const axios = require('axios');
const { clearAllRateLimits } = require('../middlewares/rateLimiter');

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_USER = {
  name: 'Load Test User',
  email: `loadtest099@example.com`,
  password: 'password123'
};
const TRANSACTION_AMOUNT = 1;
const CONCURRENT_DEPOSITS = 500;
const CONCURRENT_PAYOUTS = 300;


const runLoadTest = async () => {
  const authToken = await setup();

  console.log('Starting 500 concurrent deposits...');
  const depositResults = await runConcurrentTransactions(authToken, 'deposit', CONCURRENT_DEPOSITS);

  console.log('Starting 300 concurrent payouts...');
  const payoutResults = await runConcurrentTransactions(authToken, 'payout', CONCURRENT_PAYOUTS);

  const expectedBalance = (CONCURRENT_DEPOSITS - CONCURRENT_PAYOUTS) * TRANSACTION_AMOUNT;
  const actualBalance = await verifyBalance(authToken);

  console.log('\n=== Test Summary ===');
  console.log(`Successful deposits: ${depositResults.filter(r => r.success).length}/${CONCURRENT_DEPOSITS}`);
  console.log(`Successful payouts: ${payoutResults.filter(r => r.success).length}/${CONCURRENT_PAYOUTS}`);
  console.log('Test completed!');
};

const setup = async () => {
  try {
    await clearAllRateLimits();

    await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    return loginRes.data.token;
  } catch (err) {
    console.error('Setup failed:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    process.exit(1);
  }
};

const runConcurrentTransactions = async (authToken, endpoint, count) => {
  const requests = Array(count).fill().map(async (_, i) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/wallet/${endpoint}`,
        { amount: TRANSACTION_AMOUNT },
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }
      );
      console.log(`${endpoint} ${i + 1}: Status ${res.status}`);
      return { success: true, data: res.data };
    } catch (err) {
      console.error(`${endpoint} ${i + 1} failed:`, err.message);
      return { success: false, error: err.message };
    }
  });

  return Promise.all(requests);
};

const verifyBalance = async (authToken) => {
  try {
    const res = await axios.get(`${BASE_URL}/wallet/`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    // console.log(`Final balance: ${res.data.data.balance}`);
    return res.data.data.balance;
  } catch (err) {
    console.error('Balance check failed:', err.message);
    return null;
  }
};

runLoadTest();