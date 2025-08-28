const { body, validationResult } = require('express-validator');

const passwordRules = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number');

const phoneRule = body('phone')
  .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
  .isNumeric().withMessage('Phone must contain only digits');

const emailRule = body('email')
  .isEmail().withMessage('Invalid email format');

const confirmPasswordRule = body('confirmPassword')
  .custom((value, { req }) => value === req.body.password)
  .withMessage('Passwords do not match');

const agreeRule = body('agree')
  .equals('true').withMessage('You must agree to the terms');

exports.validateUserSignup = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  emailRule,
  phoneRule,
  passwordRules,
  confirmPasswordRule,
  agreeRule,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  }
];

exports.validateLawyerSignup = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  emailRule,
  phoneRule,
  passwordRules,
  confirmPasswordRule,
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative number'),
  body('location').notEmpty().withMessage('Location is required'),
  body('barNumber')
    .isAlphanumeric().withMessage('Bar number must be alphanumeric')
    .isLength({ min: 6 }).withMessage('Bar number must be at least 6 characters'),
  body('bio').isLength({ min: 10 }).withMessage('Bio must be at least 10 characters'),
  agreeRule,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }
    next();
  }
]; 