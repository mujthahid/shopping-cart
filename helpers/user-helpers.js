var db=require('../config/connection')
var collection=require('../config/collections')
// installed an encryption module named bcrypt
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectID

module.exports={
    // encrypting password and storing that along with user data in database while signup
doSignup:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        userData.Password=await bcrypt.hash(userData.Password,10)
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(db.get().collection(collection.USER_COLLECTION).findOne({_id:data.insertedId}))
            
        })
    })

    },
    doLogin:(userData)=>{ 
        // checking for login email in db and then comparing the encrypted password with user entered password while login
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
if(status){
    console.log('login success');
    response.status=true
    response.user=user
    resolve(response)
}
else{
    console.log('login failed');
    resolve({status:false})
}
                })
            }
            else{
                console.log('login failed');
                resolve({status:false})
            }

        })
    },
    //user id and product id is passed, would the find the user cart if any, from the db using id, else new cart will be created
//* products added to that cart
    addToCart:(prodId,userId)=>{
        let proObj={
            item: ObjectId(prodId),
            quantity: 1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==prodId)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':ObjectId(prodId),user:ObjectId(userId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then((response)=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
            {
                $push:{products:proObj}
            }).then((response)=>{
resolve()
            })
        }
            }else{
                let cartObj ={
                    user: ObjectId(userId),
                    products : [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
       
    },
    //accessing cart items of user to display in the cart page by the aggregation method
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
    { 
        $match: {user:ObjectId(userId)}
     },

{
    $unwind:'$products'
},

   {
    $project:{
        item:'$products.item',
        quantity:'$products.quantity'
    }
   },
   {
    $lookup:{
        from:collection.PRODUCT_COLLECTION,
        localField:'item',
        foreignField:'_id',
        as:'product'
    }
   },
   {
    $project:{
        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
    }
   }
]).toArray()
resolve(cartItems)
        })
    },

getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count=0
      let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
        if(cart){

     count= cart.products.length     
        }
        resolve(count)
    })
},
changeProductQuantity:(details)=>{
    count=parseInt(details.count)
    quantity=parseInt(details.quantity)
    
    return new Promise((resolve,reject)=>{
        if(count==-1 && quantity==1){
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
            {
                $pull:{products:{item:ObjectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true})
            })
        }else{
        db.get().collection(collection.CART_COLLECTION).updateOne({'products.item':ObjectId(details.product),_id:ObjectId(details.cart)},
        {
            $inc:{'products.$.quantity':count}
        }
        ).then((response)=>{
           
            resolve(true)
        })
    }
    })
},

removeFromCart:(details)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
        {
            $pull:{products:{item:ObjectId(details.product)}}
        }).then((response)=>{
            resolve({removeProduct:true})
        })

    })
}
}
