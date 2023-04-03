//need to stop loadmore if no more product otherwise breaking user experience

// const{UserDB,ProductDB} = require("../database/schema");
// const {getUserViaEmail,getUserViaEmailPassword,getUserViaEmailToken} = require("../services/getUser")
// const {getproduct,getNextProduct,getProductById} = require("../services/getProduct")
// const {findViaEmailAndUpdateCart} = require("../services/updateUser")

// sqlservices
const {getProduct,getNextProduct} = require('../services/sqlServices/product/getProduct');
const {getCartID,checkProductInCartItems,getTotals} = require('../services/sqlServices/cart/getCart');
const {saveCart} = require('../services/sqlServices/cart/postCart');
const {getOrderItems} = require('../services/sqlServices/orders/getOrder');


const getHomepage = async (req,res)=>{
	let result= await getProduct()
	if(req.session.is_logged_in){
		//get cart
		let cart =  await getCartID(req.session.UserID);
		//add cartID & total qty to session
		req.session.cartID = cart.recordset[0].cartID;
		let totals = await getTotals(cart.recordset[0].cartID)
		req.session.quantity = totals.recordset[0].totalQuantity;
		req.session.totalPrice= totals.recordset[0].totalPrice;
		let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin,role:req.session.role}
		res.render("pages/index",{data: data,error:"",products:result.recordset,quantity:totals.recordset[0].totalQuantity,numProds:4});
	}else{
		req.session.is_logged_in=false;
		let data = {name:"user", session: false,isAdmin:false}
		res.render("pages/index",{data: data,error:"",products:result.recordset,quantity:0,numProds:4});
	}
}
//change session storage if you want to change number of product loaded along with numberes here
const loadMoreProducts =  async (req,res)=>{
    let skipProductCount = parseInt(req.params.count);
    let result = await getNextProduct(skipProductCount);
    res.status(200).send({result:result.recordset, nextProductCount:(skipProductCount+4)});
}

const addToCart = async (req,res)=>{  //remember query parameter and router pareameter are different her i use query string and in send email i used rel parameter
		let {id} = req.query; 
		let userCartID = req.session.cartID
		let cartProduct = await checkProductInCartItems(userCartID,id)
		if(cartProduct.recordset.length!=0){
			res.send({msg:"item already in cart"})
		}else{
			await saveCart(userCartID,id)
			req.session.quantity +=1;
			res.json({ quantity:req.session.quantity});
		}
}

const getUserOrders = async(req,res)=>{
    let result= await getOrderItems(req.session.UserID)
    let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin,role:req.session.role}
    res.render("pages/userOrders",{data: data,error:"",result:result.recordset,quantity:req.session.quantity});
}

const logout = (req,res)=>{
	req.session.destroy();
	res.redirect("/login")
}
module.exports = {
    getHomepage,loadMoreProducts,addToCart,logout,getUserOrders
}