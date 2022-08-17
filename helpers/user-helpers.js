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
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){ db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
            {
                $push:{products:ObjectId(prodId)}
            }).then((response)=>{
resolve()
            })

            }else{
                let cartObj ={
                    user: ObjectId(userId),
                    products : [ObjectId(prodId)]
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
        $lookup:{
            from: collection.PRODUCT_COLLECTION,
            let:{proList:'$products'} ,
            pipeline : [{
                $match:{
                    $expr:{
                        $in:['$_id',"$$proList"]
                    }
                }
            }
        ],
            as:'cartItems'
        }
     }
     //passing the results to an array
]).toArray()
resolve(cartItems)
        })
    }

}
