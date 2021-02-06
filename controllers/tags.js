const Tags=require('../models/tags')
const Blog = require('../models/blog');
const slugify=require('slugify')
const {errorHandler} =require('../helpers/dberrorHandler')

exports.create=(req,res)=>{
    var slug=slugify(req.body.name).toLowerCase()
    var tag=new Tags({
        name:req.body.name,
        slug
    })
    tag.save((err,data)=>{
        if(err)
        {
            res.status(400).json({
                error:errorHandler(err)
            })
        }
        else{
            res.status(201).json(data)
        }
    })
}

exports.list=(req,res)=>{
    Tags.find({}).exec((err,tag)=>{
        if(err)
        {
            res.status(400).json({
                error:err
            })
        }
        else{
            res.status(200).json({
                message:"All tags retrieved",
                payload:tag
            })
        }
    })
}

exports.read=(req,res)=>{
    Tags.findOne({slug:req.params.slug}).exec((err,tag)=>{
        if(err)
        {
            res.status(400).json({
                error:err
            })
        }
        Blog.find({ tags: tag, isPublished:true})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt isPublished')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({ tag: tag, blogs: data });
            });
    })
}

exports.remove=(req,res)=>{
    Tags.findOneAndRemove({slug:req.params.slug}).exec((err,tag)=>{
        if(err)
        {
            res.status(400).json({
                error:err
            })
        }
        else{
            res.status(200).json({
                message:"Tag deleted"
            })
        }
    })
}