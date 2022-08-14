//setting path for db
var db=require('../config/connection')
var collection=require('../config/collections')
module.exports={
    //gets req.body as product here
    addProduct:(product,callback)=>{
        // console.log(product)
        //inserting products to the database collection
db.get().collection('product').insertOne(product).then((data)=>{
   //set up callback function to the 
    callback(data.insertedId)
})
    },
    //assigning the function to get the product list from the database.
    getAllProducts: ()=>{
        return new Promise(async(resolve,reject)=>{
let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
resolve(products)})
        }
    }
