const express = require("express")
const auth = require("../../middleware/auth")
const Profile = require('../../models/Profile')
const router = express.Router()

//Get current User Profile
router.get('/me',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar'])
        if(!profile)return res.status(400).send('Could not find user profile')
        res.json(profile)
    }catch(err){
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})


module.exports = router