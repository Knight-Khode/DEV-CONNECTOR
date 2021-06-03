const express = require("express")
const auth = require('../../middleware/auth')
const router = express.Router()

router.get('/',auth,async(req,res)=>{
    res.send('Auth route')
})

module.exports = router