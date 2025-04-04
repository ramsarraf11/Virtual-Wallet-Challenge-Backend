const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils/errorResponse');
const redisConfig = require('../queues/transactionQueue').connection;

function startTransactionWorkers() {
  const worker = new Worker('transactionQueue', async job => {
    try {
      const { walletId, amount, type } = job.data;
      
      const wallet = await Wallet.findById(walletId);
      if (!wallet) throw new ErrorResponse('Wallet not found', 404);
      
      if (type === 'PAYOUT' && wallet.balance < amount) {
        throw new ErrorResponse('Insufficient balance', 400);
      }
      
      const newBalance = type === 'DEPOSIT' 
        ? wallet.balance + amount 
        : wallet.balance - amount;
      
      await Wallet.updateOne(
        { _id: walletId },
        { $set: { balance: newBalance } }
      );
      
      const transaction = new Transaction({
        wallet: walletId,
        amount,
        type,
        status: 'COMPLETED',
        reference: uuidv4()
      });
      
      await transaction.save();
      
      return {
        success: true,
        newBalance,
        transactionId: transaction._id
      };
    } catch (error) {
      const transaction = new Transaction({
        wallet: job.data.walletId,
        amount: job.data.amount,
        type: job.data.type,
        status: 'FAILED',
        reference: uuidv4(),
        metadata: { error: error.message }
      });
      await transaction.save();
      
      throw error;
    }
  }, {
    connection: redisConfig,
    concurrency: 5
  });

  worker.on('completed', job => {
    console.log(`Transaction ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Transaction ${job.id} failed:`, err.message);
  });

  console.log('Transaction workers started');
}

module.exports = { startTransactionWorkers };
