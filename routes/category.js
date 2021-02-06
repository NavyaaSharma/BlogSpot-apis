const express=require('express')
const {requireSignin,adminMiddleware} = require('../controllers/auth')
const router=express.Router()

const {categoryValidator}=require('../validators/category')
const {validationResult}=require('../validators/index')
const {create,list,read,remove} = require('../controllers/category')

router.post('/category',categoryValidator,validationResult,requireSignin,adminMiddleware,create)
router.get('/categories',list)
router.get('/category/:slug',read)
router.delete('/category/:slug',requireSignin,adminMiddleware,remove)

module.exports=router