const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

exports.generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return {
    token: resetToken,
    expires: resetTokenExpire,
    hashedToken: crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
  };
};