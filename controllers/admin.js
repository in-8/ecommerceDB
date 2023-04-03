// const{UserDB,ProductDB} = require("../database/schema");
// const {getproduct,getNextProduct} = require("../services/getProduct")
// const { saveProduct } = require("../services/saveProduct");
// const {updateProduct} = require("../services/updateProduct")
// const {updateProductFromCart} = require("../services/updateUser")
const multer = require('multer');
//sql services
const {getProduct} = require('../services/sqlServices/product/getProduct');
const {saveProduct} = require('../services/sqlServices/product/postProduct');
const {updateProduct} = require('../services/sqlServices/product/updateProduct');
const {deleteProduct} = require('../services/sqlServices/product/deleteProduct');




let maxSize = 250*1024;

const upload = multer({dest:'uploads/',
				fileFilter: (req, file, cb) => {
					if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
					cb(null, true);
					} else {
					cb(null, false);
					return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
					}
				},
				limits: { fileSize: maxSize },
}).single("image")



const getAdmin = async (req,res)=>{
	let result= await getProduct()
	let products = result.recordset
	let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin}
	res.render("pages/admin",{data: data,error:"",products:products,numProds:4,quantity:req.session.quantity});
}
//admin load more wokring with loadmore function at home.js so not changing it
const adminAddNewProduct = async (req,res)=>{
	upload(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
		  // A Multer error occurred when uploading.
			res.status(400).send({msg:err})
			console.log("multer error");
		} else if (err) {
		  // An unknown error occu
			console.log("unknown err");
			res.status(400).send()
		}else{
			// Everything went fine.
		await saveProduct(req.body.obj,req.file.filename,req.session.UserID)
			res.status(200).send({msg:"Product added successfully"})
		}
		})
	}

    const adminUpdateProduct = async (req,res)=>{
        let {id} = req.query
		//req.body.obj is in json not in
		updateProduct(req.body,id);
        res.sendStatus(200)
    }

    const adminDeleteProduct =  async (req,res)=>{
        const {id} = req.query;
		//cascade is enabled
        await deleteProduct(id);
        res.sendStatus(200)
    }

module.exports = {
    getAdmin,adminAddNewProduct,adminUpdateProduct,adminDeleteProduct
}