const express = require("express")
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Posts = require('../../models/Post')
const {check,validationResult}=require('express-validator')

//Create post
router.post('/',[auth,
    check('text','Text is required')
    .not()
    .isEmpty()
],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
    try{
        //grab active user
        const user = await User.findById(req.user.id).select('-password')

        const newPost=new Posts({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        })

        await newPost.save()
        res.json(newPost)
    }catch(err){
        console.error(err.message)
        res.send('Server Error').status(500)
    }
})

//Get all posts
router.get('/',auth,async(req,res)=>{
    try{
        const posts = await Posts.find().sort({date:-1})
        res.json(posts)
    }catch(err){
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

router.get('/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findById(req.params.id)
        if(!post)return res.status(404).json({msg:"Post does not exist"})
        res.json(post)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


router.delete('/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findOne({user:req.user.id})
        if(post.user.toString() !== req.user.id)return res.status().json({msg:'User not authorized'})
        await post.remove()
        res.json({msg:"Post removed"})
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

router.put('/likes/:id',auth,async(req,res)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
        const post = await Posts.findById(req.params.id)
        if(!post)return res.status(404).json({msg:'Post does not exist'})
        //Check if the post has already been liked
        if(post.likes.filter(l=>l.user.toString()===req.user.id).length>0){
            return res.status(400).json({msg:'Post has already been liked'})
        }
        post.likes.unshift({user:req.user.id})
        await post.save()
        res.json(post.likes)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//Unlike Route
router.put('/unlike/:id',auth,async(req,res)=>{
    try{
        const post = await Posts.findById(req.params.id)
        if(!post)return res.status(404).json({msg:'Post does not exist'})
        //Check if post has not been liked
        if(post.likes.filter(l=>l.user.toString()===req.user.id).length===0){
            return res.status(400).json({msg:'Post has not yet been liked'})
        }
        const removeIndex = post.likes.map(l=>l.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex,1)
        await post.save()
        res.json(post.likes)
    }catch(err){
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

//Comment route
router.post('/comment/:id',[
    auth,
    check('text',"Text is required")
    .not()
    .isEmpty()
],async(req,res)=>{
    try{
        const post = await Posts.findById(req.params.id)
        const user = await User.findById(req.user.id).select('-password')
        //construct comment
        const newComment = {
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        }

        //add new comment
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
})
module.exports = router