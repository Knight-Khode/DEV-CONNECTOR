const express = require("express")
const {check,validationResult} = require('express-validator')
const auth = require("../../middleware/auth")
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const config = require('config')
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

//Get profile by id
router.get('/user/:user_id',async(req,res)=>{
    try{
        const profile = await Profile.findOne({_id:req.params.user_id}).populate('user',["name","avatar"])
        if(!profile)return res.status(400).send('could not find profile')
        res.json(profile)
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

//adding user experience
router.put('/experience',[
    auth,
    check("title","Title is required")
    .not()
    .isEmpty(),
    check("company","Company is required")
    .not()
    .isEmpty(),
    check("location","Location date is required")
    .not()
    .isEmpty(),
    check("from","From date is required")
    .not()
    .isEmpty()
],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body

    //build exp object
    const newExp ={
        title,
        company,
        location,
        from,
        to,
        current,
        description 
    }
    
    try{
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile)return res.status(400).json({msg:'No profile found'})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }

})


//adding user education
router.put('/education',[
    auth,
    check("school","School is required")
    .not()
    .isEmpty(),
    check("degree","Degree is required")
    .not()
    .isEmpty(),
    check("fieldofstudy","Field of study is required")
    .not()
    .isEmpty(),
    check("from","From date is required")
    .not()
    .isEmpty()
],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())return res.status(400).json({errors:errors.array()})
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body

    //build exp object
    const newEdu ={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    
    try{
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile)return res.status(400).json({msg:'No profile found'})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }

})

//deleting experience
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile)return res.status(400).send('could not find profile')
        const removeId = profile.experience.map(e=>e.id).indexOf(req.params.id)
        profile.experience.splice(removeId,1)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.send('Server Error').status(500)
    }
})

//deleting education
router.delete('/education/:edu_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id})
        if(!profile)return res.status(400).send('could not find profile')
        const removeId = profile.education.map(e=>e.id).indexOf(req.params.id)
        profile.education.splice(removeId,1)
        await profile.save()
        res.json(profile)
    }catch(err){
        console.error(err.message)
        res.send('Server Error').status(500)
    }
})

//Get github repos
router.get('/github/:username',async(req,res)=>{
    try{
        const options={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get("githubClientSecret")}`,
            method:'GET',
            Headers:{'user-agent':'node.js'}
        }

        request(options,(error,response,body)=>{
            if(error)console.error(error)
            if(response.statusCode !== 200) return res.status(404).json({msg:'No Github profile found'})
            res.json(JSON.parse(body))
        })
    }catch(err){
        console.error(err.message)
        res.send('Server Error').status(500)
    }
    
})

module.exports = router