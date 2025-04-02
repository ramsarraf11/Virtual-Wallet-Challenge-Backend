// services/transactionService.js
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

async function processTransaction(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { walletId, amount, type } = data;
    
    // 1. Get the wallet with lock to prevent race conditions
    const wallet = await Wallet.findById(walletId).session(session).select('balance').lean();
    if (!wallet) throw new Error('Wallet not found');
    
    // 2. Validate payout request
    if (type === 'PAYOUT' && wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // 3. Calculate new balance
    const newBalance = type === 'DEPOSIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount;
    
    // 4. Update wallet balance
    await Wallet.updateOne(
      { _id: walletId },
      { $set: { balance: newBalance } },
      { session }
    );
    
    // 5. Create transaction record
    const transaction = new Transaction({
      walletId,
      amount,
      type,
      status: 'COMPLETED',
      reference: uuidv4()
    });
    
    await transaction.save({ session });
    
    // 6. Commit the transaction
    await session.commitTransaction();
    
    return {
      success: true,
      newBalance,
      transactionId: transaction._id
    };
  } catch (error) {
    await session.abortTransaction();
    
    // Log failed transaction
    const transaction = new Transaction({
      walletId: data.walletId,
      amount: data.amount,
      type: data.type,
      status: 'FAILED',
      reference: uuidv4(),
      metadata: { error: error.message }
    });
    await transaction.save();
    
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { processTransaction };