var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  //getting products from the database
  productHelper.getAllProducts().then((products)=>{
    res.render('user',{admin:false,products});
  }) 
})
 
module.exports = router
