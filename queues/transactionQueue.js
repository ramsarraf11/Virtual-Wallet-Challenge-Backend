const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Simple local Redis configuration
const connection = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: 5,
  enableOfflineQueue: false
});

connection.on('connect', () => {
  console.log('✅ Connected to local Redis');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

const transactionQueue = new Queue('transactionQueue', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

module.exports = transactionQueue;