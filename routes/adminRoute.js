const express = require("express")
const admin_router = express()

const session = require('express-session')
admin_router.use(session({
    secret : "mysecret",
    resave : false,
    saveUninitialized : false,
    cookie:{ maxAge:60*1000,secure:false}
}))

const bodyparser = require("body-parser")
admin_router.use(bodyparser.json())
admin_router.use(bodyparser.urlencoded({extended:true}))


admin_router.set('view engine','ejs') 
admin_router.set('views','./views/admin')

const auth = require('./middleware/adminAuth')

const User = require('../models/userModel')

const bcrypt = require('bcrypt')

const securePassword = async (password)=>{
  const passwordHash = await bcrypt.hash(password,10)
  return passwordHash
}
// const bcrypt = require('bcrypt')
// const { redirect } = require("express/lib/response")

const adminData = {
     email : 'admin@gmail.com',
     password : 'admin'
}


admin_router.get('/',auth.isLogout,(req,res)=>{
    try {
        res.render('ad-login')
    } catch (error) {
        console.log(error.message);
    }
})


admin_router.post('/',(req,res)=>{
    try {

        if(req.body.email==adminData.email &&  req.body.password == adminData.password){
            req.session.user = req.body.email
            res.redirect('/admin/home')
        }else{
            res.render('ad-login',{message:'login failed!'})

        }

    } catch (error) {
        console.log(error.message)
    }
})

admin_router.get('/home',auth.isLogin,async (req,res)=>{
    try {
        const userData = await User.find()
        res.render('ad-home',{users:userData})
    } catch (error) {
        console.log(error.message);
    }
})

admin_router.get('/logout',auth.isLogin,(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
})

admin_router.get('/add-user',auth.isLogin,async (req,res)=>{
    try {
        res.render('add-user')

    } catch (error) {
     console.log(error.message);   
    }
})
admin_router.post('/add-user',async (req,res)=>{
    const spassword = await securePassword(req.body.password)
    var user = new User({
        name:req.body.name,
        email:req.body.email,
        password:spassword,
    })
        
    
    const userData = await user.save()

    if(userData){
        res.render('add-user',{message:'You have added Successfully!'})
    }else{
        res.render('add-user',{message:'Your registration failed!'})

    }
})



admin_router.get('/edit-user',auth.isLogin,async(req,res)=>{
    const id = req.query.id
    const userData = await User.findById({_id:id})
    if(userData){
        res.render('edit-user',{user:userData})

    }else{
        res.redirect('/admin/home')
    }
 })

admin_router.post('/edit-user',async (req,res)=>{
    try {
        
       const userData = await User.findByIdAndUpdate({_id:req.body.id}, {$set:{ name : req.body.name, email : req.body.email}})
        res.redirect('/admin/home')

    } catch (error) {
        console.log(error.message);
    }
})

admin_router.get('/delete-user',async(req,res)=>{
    try {
        const id = req.query.id
        await User.deleteOne({_id:id})
        res.redirect('/admin/home')

    } catch (error) {
        console.log(error.message);
    }
})

admin_router.get('*',(req,res)=>{
    res.redirect('/admin')
})


module.exports = admin_router 