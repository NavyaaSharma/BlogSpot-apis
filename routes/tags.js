const express=require('express')
const {requireSignin,adminMiddleware} = require('../controllers/auth')
const router=express.Router()

const {tagsValidator}=require('../validators/tags')
const {validationResult}=require('../validators/index')
const {create,list,read,remove} = require('../controllers/tags')

router.post('/tag',tagsValidator,validationResult,requireSignin,adminMiddleware,create)
router.get('/tags',list)
router.get('/tag/:slug',read)
router.delete('/tag/:slug',requireSignin,adminMiddleware,remove)

module.exports=router