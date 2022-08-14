const e = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products);
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
module.exports = router;
