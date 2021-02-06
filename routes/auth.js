const express=require('express')
const { signup ,signin, signout, requireSignin, preSignup, forgotPassword, resetPassword} = require('../controllers/auth')
const router=express.Router()

const {resetPasswordValidator,forgotPasswordValidator, userSigninValidator, userSignupValidator}=require('../validators/auth')
const {validationResult}=require('../validators/index')

router.post('/pre-signup', userSignupValidator, validationResult, preSignup);
router.post('/signup', signup);
router.post('/signin', userSigninValidator, validationResult, signin);
router.get('/signout', signout);
router.put('/forgot-password', forgotPasswordValidator, validationResult, forgotPassword);
router.put('/reset-password', resetPasswordValidator, validationResult, resetPassword);

module.exports=router