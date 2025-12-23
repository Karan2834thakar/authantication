const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendOTP } = require('../utils/mailer');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ id: user._id, email: user.email, name: user.name });
    
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user._id }, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If the email exists, an OTP has been sent' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otpVerified = false;
    await user.save();

    const sendResult = await sendOTP(email, otp);
    const resp = { message: 'OTP sent to email' };
    if (sendResult && sendResult.preview) resp.preview = sendResult.preview;
    res.json(resp);
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid OTP or email' });

    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires && user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

    user.otpVerified = true;
    await user.save();

    const resetToken = generateToken({ id: user._id, type: 'reset' }, { expiresIn: '15m' });
    res.json({ message: 'OTP verified', resetToken });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken) return res.status(400).json({ message: 'Reset token required' });

    const secret = process.env.JWT_SECRET;
    const payload = require('jsonwebtoken').verify(resetToken, secret);
    if (!payload || payload.type !== 'reset') return res.status(400).json({ message: 'Invalid reset token' });

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optionally check otpVerified, but resetToken already proves verification
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpVerified = false;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).json({ message: 'Reset token expired' });
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
