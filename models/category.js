const mongoose=require('mongoose')

const categoryschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        unique:true,
        index:true
    }

},{timestamps:true})


module.exports=mongoose.model('Category',categoryschema)