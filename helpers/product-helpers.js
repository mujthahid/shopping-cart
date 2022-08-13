//setting path for db
var db=require('../config/connection')
module.exports={
    //gets req.body as product here
    addProduct:(product,callback)=>{
        // console.log(product)
        //inserting products to the database collection
db.get().collection('product').insertOne(product).then((data)=>{
   //set up callback function to the 
    callback(data.insertedId)
})
    }
}