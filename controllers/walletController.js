const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const transactionQueue = require('../queues/transactionQueue');
const ErrorResponse = require('../utils/errorResponse');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return next(new ErrorResponse('Wallet not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (err) {
    next(err);
  }
};

exports.deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    const job = await transactionQueue.add('deposit', {
      walletId: wallet._id,
      amount,
      type: 'DEPOSIT'
    });
    
    res.status(200).json({
      success: true,
      message: 'Deposit request received',
      jobId: job.id
    });
  } catch (err) {
    next(err);
  }
};

exports.payout = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    const job = await transactionQueue.add('payout', {
      walletId: wallet._id,
      amount,
      type: 'PAYOUT'
    });
    
    res.status(200).json({
      success: true,
      message: 'Payout request received',
      jobId: job.id
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};