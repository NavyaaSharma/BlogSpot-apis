const mongoose=require('mongoose')

const tagschema=new mongoose.Schema({
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


module.exports=mongoose.model('Tags',tagschema)