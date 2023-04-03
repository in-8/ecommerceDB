// const{UserDB,ProductDB} = require("../database/schema");
// const {getUserViaEmailAndPopulateCart,getUserViaEmailAndPopulateCartAndSaveLater,getUserViaEmailAndPopulateSaveLater} = 
// require("../services/getUser")
// const {findViaEmailAndUpdateCart} = require("../services/updateUser")
// const {updateProductisAvailable} = require("../services/updateProduct");
// const { getProductById } = require("../services/getProduct");

//sql services
const {getCartProducts,getSaveForLater,checkProductInSaveForLater,checkProductInCartItems, getTotals} = require('../services/sqlServices/cart/getCart');
const {deleteItemFromCartItems,deleteFromSaveLater} = require('../services/sqlServices/cart/deleteCart');
const {saveForLater,saveCart,postIncreaseQuantityCart,postDecreaseQuantityCart} = require('../services/sqlServices/cart/postCart');
const {updateTotals,updateQuantity,updatetotalPriceAndQty} = require('../services/sqlServices/cart/updateCart');
const {updateIsAvailProduct} = require('../services/sqlServices/product/updateProduct');
const{getAddress}= require('../services/sqlServices/orders/getAddress');
const { getProductById } = require('../services/sqlServices/product/getProduct');




const increaseQuantityCart =  async (req,res)=>{
	const {id} = req.params;
	let result = await postIncreaseQuantityCart(req.session.cartID,id)
	req.session.totalPrice = result.total.totalPrice
	req.session.quantity = result.total.quantity
	res.send({ quantity:result.qty,totalPrice:result.total.totalPrice,price:result.price});
}

const decreaseQuantityCart = async (req,res)=>{
	const {id} = req.params;
	let result = await postDecreaseQuantityCart(req.session.cartID,id)
	req.session.totalPrice = result.total.totalPrice
	req.session.quantity = result.total.quantity
	res.send({ quantity:result.qty,totalPrice:result.total.totalPrice,price:result.price});
	
}

//deletes item from users cart
const deleteItemCart = async (req,res)=>{
	const {id} = req.params
	const cartID = req.session.cartID
	const result = await deleteItemFromCartItems(cartID,id,req.session.UserID)
	req.session.quantity = result.totalQuantity
	req.session.totalPrice = result.totalPrice
	res.status(200).send({totalPrice:result.totalPrice})
}

const getCart = async (req,res)=>{
	const userID = req.session.UserID;
	let cartItems = await getCartProducts(req.session.cartID)
	let totals = await updateTotals(userID,req.session.cartID)
	req.session.quantity = totals.recordset[0].totalQuantity;
	let savedForLaterRes = await getSaveForLater(userID);
	let savedForLater = savedForLaterRes.recordset
	let data = {name:req.session.firstName, session: true,isAdmin:req.session.isAdmin,role:req.session.role}
	if(cartItems.recordset.length ===0 ){
		res.render("pages/cart",{data: data,error:"CART IS EMPTY! BUY PRODUCTS 😄 ",products:{},quantity:0,totalPrice:0,savedForLater:savedForLater});
	}else{
		res.render("pages/cart",{data:data,error:"",quantity:totals.recordset[0].totalQuantity,products:cartItems.recordset,totalPrice:totals.recordset[0].totalPrice,savedForLater:savedForLater});
	}
	}
//didnt handle case for deletion of product in saveforlater if deleted by admin
//think if session quantity and total price needed
const postSaveForLater =  async (req,res)=>{
	const {id} = req.params;
	let userID = req.session.UserID;
	let savedForLater = await checkProductInSaveForLater(userID,id)
	if(savedForLater.recordset.length==0){
		let result = await saveForLater(userID,id,req.session.cartID);
		req.session.totalPrice = result.totalPrice;
		req.session.quantity = result.totalQuantity
		res.send({msg:"successfully saved for later",pid:id,item:result.product,totalPrice:result.totalPrice})
	}else{
		res.send({result:"error", msg:"item already in saved for later"})
	}
	
}

const postAddFromSaveLater = async function (req, res) {
    const {id} = req.params;
    let userID = req.session.UserID
	let userCartID = req.session.cartID
	let cartProduct = await checkProductInCartItems(userCartID,id)
	//if product already in cart just delete from savefor later else add to cart and then delete
	if(cartProduct.recordset.length ==0){
		await saveCart(userCartID,id)
		req.session.quantity +=1;
		res.status(200).send()
	}
	await deleteFromSaveLater(userID,id)
	res.status(200).send()
}

const getCheckout = async (req,res)=>{
	let cartID = req.session.cartID
	let cartItems= await getCartProducts(cartID)
	cartItems = cartItems.recordset
	if(cartItems.length ===0 ){
		res.redirect('/cart')
		return
		}
	let result =[];
	let totalPrice=0;
	let totalQuantity=0;
	//another check for stock
	for(let i in cartItems){
		if(cartItems[i].quantity<=0){
			await updateIsAvailProduct(cartItems[i].id)
			await deleteItemFromCartItems(cartID,cartItems[i].id,req.session.UserID)
		}else if(cartItems[i].qty>cartItems[i].quantity){
			cartItems[i].qty=cartItems[i].quantity
			await updateQuantity(cartID,cartItems[i].id,cartItems[i].quantity)
			totalPrice+=cartItems[i].qty*cartItems[i].price
			result.push(cartItems[i])
		}else{
			totalPrice+=cartItems[i].qty*cartItems[i].price
			result.push(cartItems[i])
		}
	}
	//get users address
	let address = await  getAddress(req.session.UserID)
	await updatetotalPriceAndQty(cartID,totalPrice,totalQuantity)
	let data = {name:req.session.firstName, session: true,isAdmin:req.session.isAdmin,role:req.session.role}
	res.render("pages/checkout",{data:data,error:"",quantity:"",products:result,totalPrice:totalPrice,address:address.recordset});
}

module.exports = {
    increaseQuantityCart, decreaseQuantityCart, deleteItemCart, getCart, postSaveForLater, postAddFromSaveLater, getCheckout
}