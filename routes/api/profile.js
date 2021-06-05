const express = require("express")
const router = express.Router()
const Profile = require('../../models/Profile')

//Get current User Profile
router.get('/',(req,res)=>{
    res.send('Profile route')
})


module.exports = router