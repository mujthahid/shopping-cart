//setting path for db
var db=require('../config/connection')
var collection=require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectID
module.exports={
    //gets req.body as product here
    addProduct:(prod,result)=>{
     let product={
        Name:prod.Name,
        Price:parseInt(prod.Price),
        Category:prod.Category,
        Description:prod.Description,
        Image_Public_id:result.public_id,
        Image_URL:result.url
        }
        
        //inserting products to the database collection
        return new Promise(async(resolve,reject)=>{

          await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                
                resolve()

        })

})
    },
    //assigning the function to get the product list from the database.
    getProductsByCategory: (category)=>{

        return new Promise(async(resolve,reject)=>{
let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:category}).toArray()

resolve(products)
})
        },

        getAllProducts: ()=>{

            return new Promise(async(resolve,reject)=>{
    let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    
    resolve(products)
    })
            },


    //deleting the product upon the delete button click action by the admin by passing the product id. Accessing the database document by id and deleting it.
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(prodId)}).then((response)=>{
                resolve(response)
                console.log('response is ',response)
            })

        })
    },
    // here on clicking edit button the function will collect details from db using id and return
    getProductDetails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((response)=>{
                resolve(response)
            })
        })
    },
// on the submission from the edit product page the details will be updated to the db here
    updateProduct:(prodId,proDetails)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prodId)},{
                $set:{
                    Name:proDetails.Name,
                    Price:parseInt(proDetails.Price),
                    Category:proDetails.Category,
                    Description:proDetails.Description
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    

    updateImage:(prodId,imageData) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prodId)},{
                $set:{
                    Image_Public_id:imageData.public_id,
                    Image_URL:imageData.url
                }
            }).then(()=>{
                resolve()
            })
        })
    }

}