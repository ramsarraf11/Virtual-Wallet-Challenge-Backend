const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, { timestamps: true });

// Ensure a user can only have one wallet
WalletSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', WalletSchema);