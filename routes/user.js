const { response } = require('express');
var express = require('express');
var router = express.Router();
var db=require('../config/connection')
var productHelper=require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
// set up a middleware 'verifyLogin' to verify the user is logged in.
const verifyLogin=((req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
})
/* GET home page. */
router.get('/', function(req, res, next) {
  // checking the session
  let user=req.session.user
  productHelper.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user});
  }) 
})
 router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }
  else{ res.render('user/login',{ "loginErr":req.session.loginErr})}
 
 })
 router.get('/signup',(req,res)=>{
  res.render('user/signup')
 })
 router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
   console.log(response) 
  })
 })
 router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }
    else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
 })
 router.get('/logout',(req,res)=>{
//  destroying that login session while logout
  req.session.destroy()
  res.redirect('/')
 })
//  access to the cart page
 router.get('/cart',verifyLogin,(req,res)=>{
  let user=req.session.user
 res.render('user/cart',{user})
 })
module.exports = router
