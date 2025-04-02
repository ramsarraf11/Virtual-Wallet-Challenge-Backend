const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

async function processTransaction(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { walletId, amount, type } = data;
    
    const wallet = await Wallet.findById(walletId).session(session).select('balance').lean();
    if (!wallet) throw new Error('Wallet not found');
    
    if (type === 'PAYOUT' && wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    const newBalance = type === 'DEPOSIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount;
    
    await Wallet.updateOne(
      { _id: walletId },
      { $set: { balance: newBalance } },
      { session }
    );
    
    const transaction = new Transaction({
      walletId,
      amount,
      type,
      status: 'COMPLETED',
      reference: uuidv4()
    });
    
    await transaction.save({ session });
    
    await session.commitTransaction();
    
    return {
      success: true,
      newBalance,
      transactionId: transaction._id
    };
  } catch (error) {
    await session.abortTransaction();
    
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