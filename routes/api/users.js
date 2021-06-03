const express = require("express")
const {check,validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const gravatar = require('gravatar')
const config = require('config')
const router = express.Router()
const User = require('../../models/User')

router.post('/',[
    check('name', 'Nmae is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({min:6})
],
async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
    try{
        const {name,email,password}=req.body

        //see if user exist
        let user = await User.findOne({email:email})
        if(user)return res.status(400).json({errors:[{msg:'User Already Exists'}]})

        //find user avatar
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        //if not create user
        user = new User({
            name,
            email,
            password,
            avatar
        })

        const salt= await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password,salt)
        await user.save()

        //create token
        const payload ={
            user:{
                id:user._id
            }
        }
        jwt.sign(payload,config.get('jwtSecrete'),
        {expiresIn:36000},
        (err,token)=>{
            if(err) throw err
            res.json({token})
        })
        
    }catch(ex){
        console.error(ex.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router