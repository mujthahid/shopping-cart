var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var adminHelpers=require('../helpers/admin-helpers');
const { Db } = require('mongodb');
const { Signup } = require('../helpers/admin-helpers');
const cloudinary = require('../utils/cloudinary')

const verifyAdmin = ((req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  }
  else {
    res.redirect('/admin/login')
  }
})


router.get('/login', (req, res) => {
  
  if (req.session.adminLoggedIn) {
    res.redirect('/admin')
  }
  else {
     res.render('admin/login', { "loginErr": req.session.loginErr,admin:true })
     }

})
router.post('/login', (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    }
    else {
      req.session.loginErr = "Invalid Username or Password"
      res.redirect('/admin/login')
    }
  })
})
router.get('/logout', (req, res) => {
  //  destroying that login session while logout
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin/login')
})

router.get('/',verifyAdmin,async(req,res)=>{
await adminHelpers.adminDatas().then((data)=>{
data.netSales=data.netSales.toLocaleString()
data.pendingAmount=data.pendingAmount.toLocaleString()
data.totalRefund=data.totalRefund.toLocaleString()
data.amountOnline=data.amountOnline.toLocaleString()
data.amountOffline=data.amountOffline.toLocaleString()
  res.render('admin/Home',{admin:true,data})
})

})


router.get('/view-products',verifyAdmin, function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true,products});
  })
 
 
 
}); 
//assigning add-product page

router.get('/add-product',verifyAdmin,(req,res)=>{
  res.render('admin/add-product',{admin:true})
})

//assigning add product submit option

router.post('/add-product',verifyAdmin, (req,res)=>{
let image = req.files.Image

try{

  cloudinary.uploader.upload(image.tempFilePath,{
   folder: "Products",
   unique_filename: true 
  }).then( result=> {
  console.log(result)
 productHelper.addProduct(req.body,result).then(()=>{
  res.redirect('/admin/view-products')
  })
  });

}

catch(err){
  console.log(`error : ${err}`)
}

  
 
})
//  product database id is passed to the productHelper
router.get('/delete-product/:id',verifyAdmin,async(req,res)=>{
  let proId=req.params.id
 let product = await productHelper.getProductDetails(proId)
 let public_id = await product.Image_Public_id
 await cloudinary.uploader.destroy(public_id, function(result){
   console.log(result) });
 productHelper.deleteProduct(proId).then((response)=>{
  res.redirect('/admin/view-products')
 })
})

router.get('/edit-product/:id',verifyAdmin,async(req,res)=>{
 let product=await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product,admin:true})
})

router.post('/edit-product/:id',verifyAdmin,(req,res)=>{
 
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
     
if(req?.files?.Image){
let image=req.files.Image
PublicID = req.body.PublicID
try {

  cloudinary.uploader.upload(image.tempFilePath,{
   public_id:PublicID,
   unique_filename: true,
   overwrite: true
  }).then(result=> {
    console.log(result)
  productHelper.updateImage(req.params.id,result)
}).then(()=>{
  res.redirect('/admin/view-products')
})
}
catch(err){
  console.log(`error : ${err}`)
}
}else{
res.redirect('/admin/view-products')
}

})

})

router.get('/all-orders',verifyAdmin,async(req,res)=>{
  await adminHelpers.getAllOrders().then((orders)=>{
    res.render('admin/allOrders',{admin:true,orders})
  })
})
router.post('/all-orders',verifyAdmin,async(req,res)=>{

  await adminHelpers.shippingStatus(req.body.orderId).then(()=>{
    res.json({status:true})
  })
})


router.get('/view-ordered-products/:id',verifyAdmin,async (req, res) => {
  console.log(req.params.id);
let products = await adminHelpers.OrderedProducts(req.params.id)
  res.render('admin/orderedProducts', { admin:true, products })
  
})
router.get('/all-users',verifyAdmin,async(req,res)=>{
  let user=await adminHelpers.getAllUsers()
  res.render('admin/allUsers',{admin:true, user})
})
router.get('/change-banners',verifyAdmin,(req,res)=>{
res.render('admin/changeBanner',{admin:true})
})
router.post('/change-banners',verifyAdmin,(req,res)=>{
  res.redirect('/admin')
  console.log(req.body);
  if(req?.files?.bannerImage){

    let image=req.files.bannerImage
let id=req.body.BannerID
      image.mv('./public/banner-images/'+id+'.jpg')
  }
})

module.exports = router;
