const jwt = require('jsonwebtoken');

const generateToken = (payload, opts = {}) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  const signOptions = {};
  if (opts.expiresIn) signOptions.expiresIn = opts.expiresIn;

  return jwt.sign(payload, secret, signOptions);
};

module.exports = generateToken;
