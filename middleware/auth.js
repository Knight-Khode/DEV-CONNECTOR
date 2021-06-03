const express = require('express')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check,validationResult} = require('express-validator')


module.exports = async function(req,res,next){
    const token = req.header('x-auth-token')
    if(!token)res.status(401).json({msg:'No token, authorization denied'})

    try{
        //check token
        const decode = jwt.verify(token,config.get('jwtSecrete'))
        req.user = decode.user
        next()
    }catch(ex){
        console.error(ex.mesage)
        res.status(401).json({msg:'Tken is not valid'})
    }
}