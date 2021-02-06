const mongoose=require('mongoose')
const crypto=require('crypto')
const { strict } = require('assert')

const userschema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        index:true,
        lowercase:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    hash_password:
    {
        type:String,
        required:true
    },
    salt:String,
    about:
    {
        type:String,
    },
    profile:
    {
        type:String
    },
    role:
    {
        type:Number,
        default:0
    },
    photo:
    {
        data:Buffer,
        contentType:String
    },
    ResetPasswordLink:
    {
        type:String,
        default:''
    }

},{timestamps:true})
userschema.methods={
    authenticate:function(plainpass)
    {
        return this.encryptPassword(plainpass)==this.hash_password
    },
    encryptPassword:function(password)
    {
        if(!password)
        return ''
        try{
            return crypto.createHmac('sha1',this.salt).update(password).digest('hex')
        }
        catch(err)
        {
            return ''
        }
    },

    makeSalt:function()
    {
        return Math.round(new Date().valueOf() * Math.random())+''
    }
}
userschema.virtual('password').set(function(password){
    this._password=password
    this.salt=this.makeSalt()
    this.hash_password=this.encryptPassword(password)
}).get(function(){
    return this._password
})


module.exports=mongoose.model('User',userschema)