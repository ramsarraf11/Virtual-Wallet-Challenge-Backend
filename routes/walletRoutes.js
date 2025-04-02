const express = require('express');
const { protect } = require('../middlewares/authentication');
const { depositValidator, payoutValidator } = require('../validators/walletValidator');
const {getWallet, deposit, payout, getTransactions } = require('../controllers/walletController');

const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.post('/deposit', depositValidator, deposit);
router.post('/payout', payoutValidator, payout);
router.get('/transactions', getTransactions);

module.exports = router;