const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validators');

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Invalid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required').isStrongPassword().withMessage('Password must be at least 8 characters long and include uppercase letters, numbers, and symbols')
      // .isLength({ min: 8 })
      // .withMessage('Password must be at least 8 characters')
      // .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/\?]).{8,}$/)
      // .withMessage('Password must contain at least one uppercase letter and one special character')
  ],
  handleValidation,
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidation,
  authController.login
);

router.post(
  '/forgot',
  [body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email')],
  handleValidation,
  authController.forgotPassword
);

// Note: verify-otp endpoint removed; reset now verifies OTP directly using `/reset-password`.

router.post(
  '/reset-password',
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email'),
    body('otp')
      .trim()
      .isNumeric()
      .withMessage('OTP must contain only digits')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
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
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/\?]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter and one special character')
  ],
  handleValidation,
  authController.changePassword
);

module.exports = router;
