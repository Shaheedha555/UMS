
const express = require("express")
const user_router = express()

const session = require('express-session')
user_router.use(session({
    secret : "mysecret",
    resave : false,
    saveUninitialized : false,
    cookie:{ maxAge:60*1000,secure:false}
}))

const auth = require('./middleware/auth')

const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const securePassword = async (password)=>{
  const passwordHash = await bcrypt.hash(password,10)
  return passwordHash
}



user_router.set('view engine','ejs')
user_router.set('views','./views/users')

const bodyparser = require("body-parser")
user_router.use(bodyparser.json())
user_router.use(bodyparser.urlencoded({extended:true}))
 

user_router.get('/register',auth.isLogout,(req,res)=>{

    res.render('registration')

})
user_router.post('/register',async (req,res)=>{
    const {name,email,password} = req.body
    let user = await User.findOne({email})
     
    if(user){
        return res.redirect('/register')

    }

    const spassword = await securePassword(req.body.password)
    user = new User({
        name:req.body.name,
        email:req.body.email,
        password:spassword,
    })
        
    
    const userData = await user.save()

    if(userData){
        res.render('registration',{message:'You have registered Successfully!'})
    }else{
        res.render('registration',{message:'Your registration failed!'})

    }
})

user_router.get('/',auth.isLogout,(req,res)=>{
    res.render('login')
})

user_router.get('/login',async (req,res)=>{

    res.redirect('/')

})
user_router.post('/login', async (req,res)=>{
    try {
        const email = req.body.email
        const password= req.body.password

       const userData = await User.findOne({email:email})

       if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
         if(passwordMatch){
             req.session.user_id = userData._id
            res.redirect('/home')
         }else{
            res.render('login',{message:'Your Email or Password is incorrect!'})

         }
       }else{
        res.render('login',{message:'Your Email or Password is incorrect!'})

       }
        
    } catch (error) {
        console.log(error.message);
    }
})

user_router.get('/',(req,res)=>{
    res.render('login')
})

user_router.get('/home',auth.isLogin, async(req,res)=>{
    
    const userData = await User.findById({_id:req.session.user_id})
        res.render('homepage',{user:userData})

})

user_router.get('/logout',auth.isLogin,async (req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
})

module.exports = user_router 