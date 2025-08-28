const express = require('express');
const router = express.Router();
const { signupUser, signupLawyer, verifyOtp, loginWithOtp, login } = require('../controllers/authController');
const { validateUserSignup, validateLawyerSignup } = require('../middlewares/validateSignup');

router.post('/signup/user', validateUserSignup, signupUser);
router.post('/signup/lawyer', validateLawyerSignup, signupLawyer);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/login-otp', loginWithOtp);

module.exports = router; 