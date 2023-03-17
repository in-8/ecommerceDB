const{ProductDB} = require("../database/schema");

const updateProductisAvailable = async function(product){
    product.isAvailable = false;
    await product.save();
}

const updateProduct= async function(id,req){
    await ProductDB.findByIdAndUpdate(id,{
        qty:req.body.qty,
        name:req.body.name,
        price: req.body.price,
        details:req.body.details
    })
}



module.exports ={
    updateProductisAvailable,updateProduct
}
