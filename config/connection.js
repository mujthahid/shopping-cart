//requiring mongoClient here
const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://mujthahid:12312312@cluster0.m3v4p1i.mongodb.net/?retryWrites=true&w=majority'
const dbname='shopping'
mongoClient.connect(url,(err,data)=>{
    if(err) return done(err)
 state.db=data.db(dbname)
 done()
})

}
module.exports.get=function(){
    return state.db
}