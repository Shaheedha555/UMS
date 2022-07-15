const mongoose = require( 'mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/UMS")

const express = require("express")
const app = express()
const port = process.env.PORT || 2000
const userRoute = require('./routes/userRoute')
// const bodyparser = require("body-parser")
// const path = require("path")
// const { Router } = require("express")
 
// app.use('/route',Router)
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

     
app.listen(port,()=>{ 
    console.log(`Server is running on http://localhost:${port}`)
})        
