var db = require('../config/connection')
var collection = require('../config/collections')
// installed an encryption module named bcrypt
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId

module.exports={

  Signup: () => {
        let adminData={
            Username:'admin',
            Password:'12345'
        }
        return new Promise(async (resolve, reject) => {
            
                adminData.Password = await bcrypt.hash(adminData.Password, 10)
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then(() => {
                    resolve()
    
                })
            
           
        })

    },
    
    adminLogin: (Data) => {
        // checking for login email in db and then comparing the encrypted password with user entered password while login
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Username: Data.Username })
            if (admin) {
                bcrypt.compare(Data.Password, admin.Password).then((status) => {
                    if (status) {
                        
                        response.status = true
                        response.admin = admin
                        resolve(response)
                    }
                    else {
                        
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

getAllOrders:()=>{
  return new Promise(async(resolve,reject)=>{
    let orders=await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
    resolve(orders)
  })
},
OrderedProducts:(orderId)=>{
       
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

getAllUsers:()=>{
    return new Promise((resolve,reject)=>{
        let user=db.get().collection(collection.USER_COLLECTION).find({}).toArray()
        resolve(user)
    })
},

shippingStatus:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{status:'shipped'}
        }).then(()=>{
            resolve()
        })
    })
},
adminDatas:()=>{
    return new Promise(async(resolve,reject)=>{
    let netSales=0
    let pendingAmount=0
    let totalRefund=0
    let amountOnline=0
    let amountOffline=0
      let placedOrdersOnline=await db.get().collection(collection.ORDER_COLLECTION).count({status:'placed',method:'online'})
      let placedOrdersOffline=await db.get().collection(collection.ORDER_COLLECTION).count({status:'placed',method:'COD'})
      let pendingOrders=await db.get().collection(collection.ORDER_COLLECTION).count({status:'pending'})
      let cancelledOrdersOnline=await db.get().collection(collection.ORDER_COLLECTION).count({status:'cancelled',method:'online'})
     let cancelledOrdersOffline=await db.get().collection(collection.ORDER_COLLECTION).count({status:'cancelled',method:'COD'})
      if(placedOrdersOnline+placedOrdersOffline==0){netSales=0}
      else{
         netSalesObj= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{status:'placed'}
            },
            {
                $group: {_id:"",
                    total:{$sum:'$total_amount'}
                }
            },
            {
                $project:{
                    _id:0,total:'$total'
                }
            }
           
        ]).toArray()
netSales=netSalesObj[0].total
    }
    if(pendingOrders==0){pendingAmount=0}
    else{
        pendingAmountObj=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{status:'pending'}
            },
            {
                $group: {_id:"",
                    total:{$sum:'$total_amount'}
                }
            },
            {
                $project:{
                    _id:0,total:'$total'
                }
            }
        ]).toArray()
        pendingAmount=pendingAmountObj[0].total
    }
if(cancelledOrdersOnline==0){totalRefund=0}
else{
let totalRefundObj=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    {
        $match:{status:'cancelled',
    method:'online'
    }
    },
  
    {
        $group: {_id:"",
            total:{$sum:'$total_amount'}
        }
    },
    {
        $project:{
            _id:0,total:'$total'
        }
    }
]).toArray()  

totalRefund=totalRefundObj[0].total

}

if(placedOrdersOnline==0){amountOnline=0}
else{
    let amountOnlineObj=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match:{status:'placed',
        method:'online'
        }
        },
      
        {
            $group: {_id:"",
                total:{$sum:'$total_amount'}
            }
        },
        {
            $project:{
                _id:0,total:'$total'
            }
        }
    ]).toArray() 
amountOnline=amountOnlineObj[0].total
}
if(placedOrdersOffline==0){amountOffline=0}
else{
   let amountOfflineObj=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match:{status:'placed',
        method:'COD'
        }
        },
      
        {
            $group: {_id:"",
                total:{$sum:'$total_amount'}
            }
        },
        {
            $project:{
                _id:0,total:'$total'
            }
        }
    ]).toArray()
    amountOffline=amountOfflineObj[0].total
}

    
    resolve({placedOrdersOnline,placedOrdersOffline,netSales,pendingOrders,pendingAmount,
        cancelledOrdersOnline,cancelledOrdersOffline,totalRefund,amountOnline,amountOffline})
    })
}

}