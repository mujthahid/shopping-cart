var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
 
  // adding dummy products to the admin page

   let products=[{
    name:"Samsung Galaxy M32 ",
    category:"Smartphone",
    price:"",
    description:" 6GB RAM | 128GB | Blue | 2GHz Octa-Core Processor | 6000mAh Battery "
,
    image:"https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTixiNqfsBAymquzPSH2aRlsTVbfpKoCxXTuNjU-rOfPm-BWJLUkDL2ZMEoS-hdi1IMlN7mb5rrCfIGT7cLPhAUA6M-7_OU0g8IWXZNXrvR3FdC1ksV2np-&usqp=CAE"
},{
  name:"OPPO A74 5G ",
  category:"Smartphone",
  price:"",
  description:"Fantastic Purple,6GB RAM,128GB Storage",
  image:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQnIjgyp67RsUOTEqMKAwntSFvwCJhk0B8QsNeh1-BmYcU-bLJsu5ikpZ14Ib3TbeGAE7JW0thNnvzMyti37nfpjTfW77mOvB8XAqyAZ3G3sXaOdEzQW7cJqA&usqp=CAE"
},{
  name:"Samsung Galaxy F13 5G ",
  category:"Smartphone",
  price:"",
  description:" 4GB |64GB |16.62cm /6.6in Waterfall Blue | FHD Display | Exynos 850 Processor | 8GB RAM|6000mAh Battery | Auto Data Switching"
  ,
  image:"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQYQTgaXmA2_rgRlzWtmpFl1vVqYkxS8hnuco-TQNpmsVQ3QYgSz3EYoi3dVa_q9I-py2Dx9x3dNzW38t6_Qnkn1FHI8zWbY6overLSnklUGOt2_rXKI3HvPg&usqp=CAE"
},{
  name:"Vivo Y73",
  category:"Smartphone",
  price:"",
  description:"(Roman Black, 8GB RAM, 128GB Storage) with No Cost EMI/Additional Exchange Offers",
  image:"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR2WKbAcUszZlRXW8NqDfeQsWJNcfWOIDiTiODdhGU5UXXkVGXCdjDJUq7xRBUcK71pyeWyHzWia23CWPfkMiSzRXBWIuoegThY4bz4Ryc7tDMRxep9MCq3MA&usqp=CAE"
},{
  name:"Samsung Galaxy S20 FE 5G ",
  category:"Smartphone",
  price:"",
  description:" 8GB RAM | 128GB | Cloud Mint | Snapdragon 865 | 120Hz display | Pro-grade Camera. | Smartphone",
  image:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQAxPC3Wc903Oj7JSYHw1EEhFQWpWroTG0G_9mMokC3AcuPyj88fm2vuQzNp6WoqNmQG01mRTdM7LVWQIesT1ZD0D-MDTpKYO_XRzLJCeOjCokUnVAtRLtM&usqp=CAE"
},{
  name:"Samsung Galaxy S22 Ultra",
  category:"Smartphone",
  price:"",
  description:" 12GB |256GB |17.31cm (6.8in) Burgundy | Infinity-O Displays | 5000mAh Battery",
  image:"https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTxlAldm1HsmmrRN0nu1lJw1PQjM9WDVv9UD47hj8mT5P7euBFbasN5tO2FQA0MUphOpIDgtDchji0Idn9YfUrgDhGmffm0OW7PfplkiLBI5KXbK1ms0gb6&usqp=CAE"
},{
  name:"Samsung Galaxy F23 5G",
  category:"Smartphone",
  price:"",
  description:"6GB |128GB |16.72cm (6.6in) Aqua Blue | FHD+ Infinity-U Display | Snapdragon 750G Processor | Voice Focus|5000mAh Battery",
  image:"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRywxt-83ZmA7g-o_0kHh3Z7TSbcEtaVtHPA2sRk5QeQ0NZwDhrOmllvSpXcj0v8iq_Hl3JpXnuSYP0XZ8a-qT-8KP-mF0p3mxxuARLUuKiapedIfCo5TmT&usqp=CAE"
},{
  name:"Samsung Galaxy F12",
  category:"Smartphone",
  price:"",
  description:"4GB RAM |64GB |Sky Blue | 90Hz refresh rate | Smartphone",
  image:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQa8UBrARQh9MrmN_vNgKd-OVfIikTDele-XtYvydnb3kdR_LA7RZWsS_olrqRbOYBKMvdZKs5dW7hagwXXO3ZOAeuR6nAxemK4-iL2mXVSrJ1lT5yHLG9c&usqp=CAE"
}
] //assigning dummy products to the  admin view products page
  res.render('admin/view-products',{admin:true,products});
}); //assigning add-product page
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product',{admin:true})
}) //assigning add product submit option
router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  res.render('admin/add-product',{admin:true})
})
module.exports = router;
