const express=require('express')
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
const morgan=require('morgan')
const cors=require('cors')
const mongoose=require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGODB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
})
const app=express()

const authRoutes=require('./routes/auth')
const userRoutes=require('./routes/user')
const categoryRoutes=require('./routes/category')
const tagRoutes=require('./routes/tags')
const blogRoutes = require('./routes/blog');
const formRoutes = require('./routes/form');

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())

app.use('/api',authRoutes)
app.use('/api',userRoutes)
app.use('/api',categoryRoutes)
app.use('/api',tagRoutes)
app.use('/api', blogRoutes);
app.use('/api', formRoutes);

const port=process.env.PORT || 8000
app.listen(port,()=>{
    console.log('server started')
})