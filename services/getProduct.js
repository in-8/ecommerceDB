const{ProductDB} = require("../database/schema");

const getproduct = async function(){
    return await ProductDB.find().limit(4);
}

const getNextProduct = async function(skipProductCount){
    return await ProductDB.find().skip(skipProductCount).limit(4);
}

const getProductById = async function(productId){
    return await ProductDB.findById(productId)
}


module.exports = {
    getproduct,getNextProduct,getProductById
}