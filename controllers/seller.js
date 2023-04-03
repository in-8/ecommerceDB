
const multer = require('multer');
const fs = require("fs");
const { parse } = require("csv-parse");
const csv = require('csv-parser');
const stream = require('stream');

//sql services
const {getSellerProduct,getNextSellerProduct} = require('../services/sqlServices/product/getProduct');
const {getSellerOrderItems} = require('../services/sqlServices/orders/getOrder');
const {saveBulkProduct} = require('../services/sqlServices/product/postProduct');


//multer middleware
const upload =  multer({
				fileFilter: (req, file, cb) => {
					if (file.mimetype == "text/csv") {
					cb(null, true);
					} else {
					cb(null, false);
					return cb(new Error('Only .csv, .text and .jpeg format allowed!'));
					}
				}}).single("csv")


const getSeller = async (req,res)=>{
	let result= await getSellerProduct(req.session.UserID)
	let products = result.recordset
	let data = {name:req.session.firstName, session: true, isAdmin:false,role:req.session.role}
	res.render("pages/seller",{data: data,error:"",products:products,numProds:4,quantity:req.session.quantity,sellerID:req.session.UserID});
}


const loadMoreProducts =  async (req,res)=>{
    let skipProductCount = parseInt(req.params.count);
    let result = await getNextSellerProduct(req.session.UserID,skipProductCount);
    res.status(200).send({result:result.recordset, nextProductCount:(skipProductCount+4)});
}

const getSellerOrders = async(req,res)=>{
    let result= await getSellerOrderItems(req.session.UserID)
    let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin,role:req.session.role}
    res.render("pages/sellerOrder",{data: data,error:"",result:result.recordset,quantity:req.session.quantity});
}

//highly optimised csv read 
//not saving directly reading
// saving in one db connection
const postBulkProduct = async (req,res)=>{
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
        // Create a read stream from the CSV buffer
        let data=[];
        const readStream = new stream.PassThrough();
        readStream.end(req.file.buffer);

        // Use the csv-parser to parse the CSV data
        readStream.pipe(csv())
        .on('data', (row) => {
            // Do something with each row of data
            //for insert opereation need in nested array notation so getting only values 
            data.push(row)
            // console.log(row);
        })
        .on('end', async () => {
            // All rows have been parsed
            // console.log('CSV parsing complete');
            await saveBulkProduct(req.session.UserID,data)
            res.status(200).send({msg:"Product added successfully"})
        });
		// await saveProduct(req.body.obj,req.file.filename,req.session.UserID)
		}
		})
	}

module.exports ={
    getSeller,loadMoreProducts,getSellerOrders,postBulkProduct
}