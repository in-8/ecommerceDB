const{ProductDB} = require("../database/schema");

const saveProduct = async function(req){
    const product = new ProductDB();
    let obj = JSON.parse(req.body.obj);
    product.qty = obj.quantity;
    product.name = obj.name;
    product.image = req.file.filename;
    product.price = obj.price;
    product.details = obj.details;
    await product.save();
}

module.exports ={
    saveProduct
}