const express = require("express")
const {check,validationResult} = require('express-validator')
const auth = require("../../middleware/auth")
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const router = express.Router()

//Get all profiles
router.get('/',async(req,res)=>{
    try{
        const profiles = await Profile.find().populate('user',["name","avatar"])
        res.json(profiles)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

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

//Create Profile
router.post('/',[auth,
    check('status','Status is required')
    .not()
    .isEmpty(),
    check('skills','Skills is required')
    .not()
    .isEmpty()
],
async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
    const{
        company,
        website,
        bio,
        status,
        githubUsername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    }=req.body
    
    //Build profile object
    const profileFields ={}
    profileFields.user = req.user.id
    if(company)profileFields.company = company
    if(website)profileFields.website = website
    if(bio)profileFields.bio = bio
    if(status)profileFields.status = status
    if(githubUsername)profileFields.githubUsername = githubUsername
    if(skills){
        profileFields.skills = skills.split(',').map(s=>s.trim())
    }
    if(youtube)profileFields.social = youtube
    if(facebook)profileFields.social = facebook
    if(twitter)profileFields.instagram = instagram
    if(linkedin)profileFields.linkedin = linkedin

    try{
        //Search if user has profile
        let profile = await Profile.findOne({user:req.user.id})
        if(profile){
            profile = await Profile.findOneAndUpdate({user:req.user.id},{
                $set:profileFields
            },{new:true})
        }
        profile = new Profile(profileFields)

        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

//deleting profile and user
router.delete('/',auth,async(req,res)=>{
    try{
        //delete user
        await User.findOneAndRemove({_id:req.user.id})

        //delete profile
        await Profile.findOneAndRemove({user:req.user.id})
        res.json({msg:"User deleted"})
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router