const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validators');

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('Name too short'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/\?]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter and one special character')
  ],
  handleValidation,
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  handleValidation,
  authController.login
);

router.post('/forgot', [body('email').isEmail()], handleValidation, authController.forgotPassword);

router.post(
  '/verify-otp',
  [body('email').isEmail(), body('otp').isLength({ min: 6, max: 6 })],
  handleValidation,
  authController.verifyOTP
);

router.post(
  '/reset-password',
  [
    body('resetToken').exists(),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/\?]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter and one special character')
  ],
  handleValidation,
  authController.resetPassword
);

router.patch(
  '/change-password',
  auth,
  [
    body('currentPassword').exists(),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/\?]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter and one special character')
  ],
  handleValidation,
  authController.changePassword
);

module.exports = router;
