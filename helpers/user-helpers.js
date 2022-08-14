var db=require('../config/connection')
var collection=require('../config/collections')
// installed an encryption module named bcrypt
const bcrypt=require('bcrypt')

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
    }

}
