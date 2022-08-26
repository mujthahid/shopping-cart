var db = require('../config/connection')
var collection = require('../config/collections')
// installed an encryption module named bcrypt
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectID
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_p5neKGHUt06jiF', key_secret: 'GUGjG5bF5BZW2PuAVZIv7S4Y' })

module.exports = {
    // encrypting password and storing that along with user data in database while signup
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(db.get().collection(collection.USER_COLLECTION).findOne({ _id: data.insertedId }))

            })
        })

    },
    doLogin: (userData) => {
        // checking for login email in db and then comparing the encrypted password with user entered password while login
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.status = true
                        response.user = user
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log('login failed');
                resolve({ status: false })
            }

        })
    },
    //user id and product id is passed, would the find the user cart if any, from the db using id, else new cart will be created
    //* products added to that cart
    addToCart: (prodId, userId) => {
        let proObj = {
            item: ObjectId(prodId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': ObjectId(prodId), user: ObjectId(userId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then((response) => {
                        resolve({ productExist: true })
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {
                            $push: { products: proObj }
                        }).then((response) => {
                            resolve({ productExist: false })
                        })
                }
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve({ productExist: false })
                })
            }
        })

    },
    //accessing cart items of user to display in the cart page by the aggregation method
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: '$item',
                        quantity: '$quantity',
                        subtotal: { $multiply: ['$quantity', '$product.Price'] },
                        product: '$product'
                    }
                }

            ]).toArray()
          
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {

                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        price = parseInt(details.price)
        subtotal = parseInt(details.subtotal)
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }).then((response) => {
                    

                        resolve({removeProduct:true})
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': ObjectId(details.product), _id: ObjectId(details.cart) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }
                ).then((response) => {
                   
                    resolve({status:true})
                })
            }
        })
    },

    removeFromCart: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                {
                    $pull: { products: { item: ObjectId(details.product) } }
                }).then((response) => {
                    resolve({ removeProduct: true })
                })

        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                    }
                }
            ]).toArray()



            resolve(total[0].total)




        })

    },
    placeOrder:(order,products,total,channel)=>{
        return new Promise((resolve,reject)=>{
            let status=order.method==='cod'?'placed':'pending'
let orderObj={
    deliveryDetails:{
        fullname:order.fullname,
        contact_number:order.contact,
        address:order.address,
        city:order.city,
        state:order.state,
        zip:order.zip
    },
    userId:ObjectId(order.userId),
    date:new Date(),
    total_amount:total,
    status:status,
    products:products
   

}
db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{

if(channel==='cart'){
    db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
}
   
   

resolve(response.insertedId)

    
})
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            
            resolve(cart.products)
        })
    },
    getOrderDetails:(userId)=>{
return new Promise(async(resolve,reject)=>{
 let orders= await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()

 resolve(orders)
})
    },
    getOrderProducts:(orderId)=>{
       
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        productId:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'productId',
                        foreignField:'_id',
                        as:'products'

                    }
                },
                {
                    $unwind:'$products'
                }
              
            ]).toArray()

          
        
            resolve(products)
        })
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
           

var options = {
  amount: total*100,  // amount in the smallest currency unit
  currency: "INR",
  receipt:""+orderId
};
instance.orders.create(options, function(err, order) {
    if(err){
        console.log(err);
    }
  console.log('new order :',order);
  resolve(order)
});


        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto=require('crypto')
            let hmac=crypto.createHmac('sha256', 'GUGjG5bF5BZW2PuAVZIv7S4Y')
            hmac.update(details['payment[razorpay_order_id]']+'|'+ details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })

    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
            {
                $set:{status:'placed',date:new Date()}
            }).then(()=>{
                resolve()
            })
            
        })
    },

    getBuyNowProduct:(proId)=>{
        
        return new Promise(async(resolve,reject)=>{
          let product=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{_id:ObjectId(proId)}
            },
            {
                $project:{price:'$Price'}
            }
           
          ]).toArray()

          product.push({products:[{item:ObjectId(proId),quantity:1}]})
console.log(product);
            resolve(product)
        
            
        })
    },
    getPendingOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
       let order= await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)})
// console.log(orderId);
// console.log(order);
resolve(order.total_amount)
        })
    }


   
}
