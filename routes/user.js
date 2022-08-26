const { response } = require('express');
var express = require('express');
var router = express.Router();
var db = require('../config/connection')
var productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
// set up a middleware 'verifyLogin' to verify the user is logged in.
const verifyLogin = ((req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/login')
  }
})
/* GET home page. */
router.get('/', async function (req, res, next) {
  // checking the session
  let user = req.session.user
  let cartCount = null
  if (user) {
    cartCount = await userHelpers.getCartCount(user._id)
  }
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });
  })
})
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else { res.render('user/login', { "loginErr": req.session.loginErr }) }

})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    //  
    req.session.loggedIn = true
    req, session.user = response
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }
    else {
      req.session.loginErr = "Invalid Username or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  //  destroying that login session while logout
  req.session.destroy()
  res.redirect('/')
})
//  access to the cart page
router.get('/cart', verifyLogin, async (req, res) => {
  let total = 0
 
  let products = await userHelpers.getCartProducts(req.session.user._id)
  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/cart', { products, user: req.session.user, total })
  } else {
    res.render('user/emptyCart', { user: req.session.user })
  }



})
//routing add to cart option
router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
    response.status = true
    res.json(response)

  })
})
router.post('/change-product-quantity', verifyLogin, (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {

    response.total = await userHelpers.getTotalAmount(req.body.userId)
    res.json(response)
  })

})

router.post('/remove-from-cart', (req, res, next) => {
  console.log(req.body);
  userHelpers.removeFromCart(req.body).then((response) => {

    res.json(response)
  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
let user=req.session.user
  let total = await userHelpers.getTotalAmount(user._id)
 
  res.render('user/placeOrder', { user: req.session.user, total })
})
router.post('/place-order', verifyLogin, async (req, res) => {
console.log(req.body);
if(req.body.channel==='buynow'){
var product= await userHelpers.getBuyNowProduct(req.body.prodId)
var products= await product[1].products
var total= await product[0].price
var channel='buynow'
}else{
  var products = await userHelpers.getCartProductList(req.body.userId)
  var total = await userHelpers.getTotalAmount(req.body.userId)
  var channel='cart'
}
 
  userHelpers.placeOrder(req.body, products, total, channel).then((orderId) => {
    if (req.body.method === 'cod') {
      res.json({ cod: true })
    } else {
      userHelpers.generateRazorpay(orderId, total).then((response) => {
        res.json(response)
      })
    }
  })
})
router.get('/order-confirmation', verifyLogin, (req, res) => {
  res.render('user/orderConfirmation', { user: req.session.user })
})
router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getOrderDetails(req.session.user._id)
  if (orders.length > 0) {
    res.render('user/orders', { user: req.session.user, orders })
  } else {
    res.render('user/emptyOrders', { user: req.session.user })
  }



})
router.get('/view-ordered-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)

  res.render('user/orderedProducts', { user: req.session.user, products })
})

router.post('/verify-payment', verifyLogin, (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("payment successful");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/buy-now/:id', verifyLogin, async (req, res) => {
  let product = await userHelpers.getBuyNowProduct(req.params.id)
  let prodId=product[0]._id
  let total=product[0].price
 let channel ='buynow'
  res.render('user/placeOrder', { user: req.session.user, total,channel,prodId})

})

router.post('/complete-order',verifyLogin,async(req,res)=>{
 
 let total=await userHelpers.getPendingOrder(req.body.orderId)
await userHelpers.generateRazorpay(req.body.orderId,total).then((response)=>{
  res.json(response)
})
})
module.exports = router
