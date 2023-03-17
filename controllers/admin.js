const{UserDB,ProductDB} = require("../database/schema");
const {getproduct,getNextProduct} = require("../services/getProduct")
const multer = require('multer');
const { saveProduct } = require("../services/saveProduct");
const {updateProduct} = require("../services/updateProduct")
const {updateProductFromCart} = require("../services/updateUser")

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
	let result= await getproduct()
	let data = {name:req.session.firstName, session: true, isAdmin:true}
	res.render("pages/admin",{data: data,error:"",products:result,numProds:4,quantity:0});
}

const adminAddNewProduct = async (req,res)=>{
	upload(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
		  // A Multer error occurred when uploading.
			res.status(400).send({msg:err})
		} else if (err) {
		  // An unknown error occu
			res.status(400).send()
		}else{
			// Everything went fine.
			saveProduct(req)
			res.status(200).send({msg:"Product added successfully"})
		}
		})
	}

    const adminUpdateProduct = async (req,res)=>{
        let {id} = req.query
		updateProduct(id,req);
        res.sendStatus(200)
    }

    const adminDeleteProduct =  async (req,res)=>{
        const {id} = req.query;
        let product = await ProductDB.findByIdAndDelete(id);
		updateProductFromCart(product)
        res.sendStatus(200)
    }

module.exports = {
    getAdmin,adminAddNewProduct,adminUpdateProduct,adminDeleteProduct
}