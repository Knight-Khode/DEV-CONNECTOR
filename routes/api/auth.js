const express = require("express")
const auth = require('../../middleware/auth')
const mongoose = require('mongoose')
const {check,validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../../models/User')
const router = express.Router()

router.get('/',auth,async(req,res)=>{
    res.send('Auth route')
})

router.post('/',
[
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with 6 or more characters').isLength({min:6})
],
async(req,res)=>{
    const errors =validationResult(req)
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()})
    const {email,password}=req.body

    try{
        //compare email
        let user = await User.findOne({email:email})
        if(!user)return res.status(404).json({msg:'Invalid Credentials'})

        //compare password
        user = await bcrypt.compare(password,user.password)
        if(!user)return res.status(404).json({msg:'Invalid Credentials'})

        //create jwt
        const payload ={
            user:{
                id:user._id
            }
        }
        jwt.sign(payload,config.get('jwtSecrete'),{expiresIn:36000},
            (err,token)=>{
                if(err) throw err
                res.json({token})
            }
        )
        
    }catch(ex){
        console.error(ex.message)
        res.status(500).send('Server error')
    }
    
})
module.exports = router