const{UserDB} = require("../database/schema");

async function getUserViaEmail(userEmail){
    return await UserDB.findOne({email:userEmail})
}

const getUserViaEmailToken = async function(userEmail,userToken){
    return await UserDB.findOne({email:userEmail,token:userToken})
}

const getUserViaEmailPassword = async function(userEmail,userPassword){
    return await UserDB.findOne({email:userEmail,password:userPassword})
}

const getUserViaEmailAndPopulateCart = async function(userEmail){
    return await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
}

const getUserViaEmailAndPopulateCartAndSaveLater = async function(userEmail){
    return await UserDB.findOne({email:userEmail}).populate('cart.items.productId').populate('saveForLater.productId');
}

const getUserViaEmailAndPopulateSaveLater = async function(userEmail){
    return await UserDB.findOne({email:userEmail}).populate('saveForLater.productId');
}

module.exports = {
    getUserViaEmail,getUserViaEmailToken,getUserViaEmailPassword,getUserViaEmailAndPopulateCart,getUserViaEmailAndPopulateCartAndSaveLater,
    getUserViaEmailAndPopulateSaveLater
}