const User = require('../models/User');
const Wallet = require('../models/Wallet');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/authUtils');

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    const wallet = await Wallet.create({ user: user._id });
    
    res.status(201).json({
      success: true,
      walletId: wallet._id
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};