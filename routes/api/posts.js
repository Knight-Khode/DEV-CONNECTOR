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
        console.log(req.user)

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

module.exports = router