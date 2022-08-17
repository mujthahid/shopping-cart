var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    // console.log(products);
    res.render('admin/view-products',{admin:true,products});
  })
 
 
 
}); //assigning add-product page
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin:true})
}) //assigning add product submit option
router.post('/add-product',(req,res)=>{
  // console.log(req.files.Image);
  productHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image
    //setting the name of image file as database id and moving to a seperate folder
    image.mv('./public/product-images/'+id+'.jpg',(err)=>{
      if(!err){
         res.render('admin/add-product',{admin:true})}
         else {
          console.log(err);
         }
    })
   

  })
 
})
//  product database id is passed to the productHelper
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
 productHelper.deleteProduct(proId).then((response)=>{
  res.redirect('/admin')
 })
})
router.get('/edit-product/:id',async(req,res)=>{
 let product=await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product,admin:true})
})
router.post('/edit-product/:id',(req,res)=>{
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req?.files?.Image){
let image=req.files.Image
let id=req.params.id
      image.mv('./public/product-images/'+id+'.jpg')
 }
  })
})
module.exports = router;
