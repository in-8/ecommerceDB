const{UserDB} = require("../database/schema");

const updateUserVerify = async function(userEmail,userToken){
   await UserDB.updateOne({email:userEmail,token:userToken},{isVerified:true})
}

const updateUserPassword = async function(userEmail,userPassword){
   await UserDB.updateOne({email:userEmail},{password:userPassword})
}

const findViaEmailAndUpdateCart = async function(userEmail,userCart){
   await UserDB.findOneAndUpdate({email:userEmail},{cart:userCart})
}

const updateProductFromCart = async function(product){
   await UserDB.updateMany({},{
       cart:{
           $pull:{													//deletes item from array
               items:{
               productId:product._id
               }
           }
       }
   })
}

module.exports ={
   updateUserVerify,updateUserPassword,findViaEmailAndUpdateCart,updateProductFromCart
}