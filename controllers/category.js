const Category=require('../models/category')
const Blog = require('../models/blog');
const slugify=require('slugify')
const {errorHandler} =require('../helpers/dberrorHandler')

exports.create=(req,res)=>{
    var slug=slugify(req.body.name).toLowerCase()
    var category=new Category({
        name:req.body.name,
        slug
    })
    category.save((err,data)=>{
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
    Category.find({}).exec((err,category)=>{
        if(err)
        {
            console.log(err)
            res.status(400).json({
                error:err
            })
        }
        else{
            res.status(200).json({
                message:"All categories retrieved",
                payload:category
            })
        }
    })
}

exports.read=(req,res)=>{
    Category.findOne({slug:req.params.slug}).exec((err,category)=>{
        if(err)
        {
            res.status(400).json({
                error:err
            })
        }
        Blog.find({ categories: category, isPublished:true })
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
                res.json({ category: category, blogs: data });
            });
    })
}

exports.remove=(req,res)=>{
    Category.findOneAndRemove({slug:req.params.slug}).exec((err,category)=>{
        if(err)
        {
            res.status(400).json({
                error:err
            })
        }
        else{
            res.status(200).json({
                message:"Category deleted"
            })
        }
    })
}