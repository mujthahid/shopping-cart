//setting path for db
var db=require('../config/connection')
var collection=require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectID
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
        },
    //deleting the product upon the delete button click action by the admin by passing the product id. Accessing the database document by id and deleting it.
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(prodId)}).then((response)=>{
                resolve(response)
            })

        })
    }
    
    }

