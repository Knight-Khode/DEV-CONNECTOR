const express = require('express')
const connectDB = require('./config/db')
const profile = require('./routes/api/profile')
const users = require('./routes/api/users')
const posts = require('./routes/api/posts')
const auth = require('./routes/api/auth')
const app = express()


app.use(express.json())
app.use('/api/profile',profile)
app.use('/api/users',users)
app.use('/api/posts',posts)
app.use('/api/auth',auth)

connectDB()
const PORT = process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server started on ${PORT}...`))