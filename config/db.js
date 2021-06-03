const mongoose = require('mongoose')

const connectDB = async ()=>{
    try{
        await mongoose.connect("mongodb://localhost/DEV-CONNECTOR",{
            useCreateIndex:true,
            useFindAndModify:false,
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log('Connected to mongodb...')
    }catch(ex){
        console.error(ex.message)
        process.env(1)
    }
}

module.exports = connectDB