const express = require('express');
const { protect } = require('../middlewares/authentication');
const { depositValidator, payoutValidator } = require('../validators/walletValidator');
const { getWallet, deposit, payout, getTransactions } = require('../controllers/walletController');
const { walletOperationLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.post('/deposit', depositValidator, walletOperationLimiter, deposit);
router.post('/payout', payoutValidator, walletOperationLimiter, payout);
router.get('/transactions', walletOperationLimiter, getTransactions);

module.exports = router;