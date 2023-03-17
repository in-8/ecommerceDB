const{UserDB,ProductDB} = require("../database/schema");
const {getUserViaEmailAndPopulateCart,getUserViaEmailAndPopulateCartAndSaveLater,getUserViaEmailAndPopulateSaveLater} = 
require("../services/getUser")
const {findViaEmailAndUpdateCart} = require("../services/updateUser")
const {updateProductisAvailable} = require("../services/updateProduct");
const { getProductById } = require("../services/getProduct");
const increaseQuantityCart =  async (req,res)=>{
	const {id} = req.params;
	let user = await getUserViaEmailAndPopulateCart(req.session.userEmail)
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.items[i].qty +=1;
			req.session.quantity += 1;
			cart.totalPrice+=cart.items[i].productId.price;
			await findViaEmailAndUpdateCart(req.session.userEmail,cart)
			res.send({ quantity:cart.items[i].qty,totalPrice:cart.totalPrice.toFixed(2),price:cart.items[i].productId.price});
			break;
		};
	}
}

const decreaseQuantityCart = async (req,res)=>{
	const {id} = req.params;
	let user = await getUserViaEmailAndPopulateCart(req.session.userEmail);
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.items[i].qty -=1;
			req.session.quantity -= cart.items[i].qty;
			cart.totalPrice-=cart.items[i].productId.price;
			await findViaEmailAndUpdateCart(req.session.userEmail,cart)
			res.status(200).send({ quantity:cart.items[i].qty,totalPrice:cart.totalPrice.toFixed(2),price:cart.items[i].productId.price})
			break;
		};
	}
}

//deletes item from users cart
const deleteItemCart = async (req,res)=>{
	const {id} = req.params;
	let user = await getUserViaEmailAndPopulateCart(req.session.userEmail);
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.totalPrice -= (cart.items[i].productId.price)*(cart.items[i].qty);
			req.session.quantity -= cart.items[i].qty;
			cart.items.splice(i,1);
			await findViaEmailAndUpdateCart(req.session.userEmail,cart)
			res.status(200).send({totalPrice:cart.totalPrice.toFixed(2)})
			break;
		};
	}
}

const getCart = async (req,res)=>{
	const userEmail = req.session.userEmail
	let user =  await getUserViaEmailAndPopulateCartAndSaveLater(userEmail)
	let cartItems = user.cart.items;
	let savedForLater = user.saveForLater;
	if(req.session.isAdmin){
		let data = {name:req.session.firstName, session: true,isAdmin:true}
		if(cartItems.length ===0 ){
			res.render("pages/cart",{data: data,error:"CART IS EMPTY! ADD PRODUCTS TO BUY!",products:{},quantity:"",totalPrice:0,savedForLater:savedForLater});
		}else{
			res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems,totalPrice:user.cart.totalPrice.toFixed(2),savedForLater:savedForLater});
		}
	}else{

		let data = {name:req.session.firstName, session: true,isAdmin:false}
		if(cartItems.length ===0 ){
			res.render("pages/cart",{data: data,error:"CART IS EMPTY! ADD PRODUCTS TO BUY!",products:{},quantity:"",totalPrice:0,savedForLater:savedForLater});
		}else{
			res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems,totalPrice:user.cart.totalPrice.toFixed(2),savedForLater:savedForLater});
		}
	}
	}
//didnt handle case for deletion of product in saveforlater if deleted by admin
const postSaveForLater =  async (req,res)=>{
	const {id} = req.params;
	let userEmail = req.session.userEmail
	let item;
	let user = await getUserViaEmailAndPopulateCart(userEmail);
	for(let i in user.cart.items){
		if(user.cart.items[i].productId.id==id){
			user.cart.totalPrice -= (user.cart.items[i].productId.price)*(user.cart.items[i].qty);
			req.session.quantity -= user.cart.items[i].qty;
			item = user.cart.items.splice(i,1)[0];
			break;
		}
	}
	user.saveForLater.push(
		{
			productId:item.productId._id
		}
	)
	await user.save();
	res.send({msg:"successfully saved for later",pid:id,item:item,totalPrice:user.cart.totalPrice})
	
}

const postAddFromSaveLater = async function (req, res) {
    const {id} = req.params;
    let userEmail = req.session.userEmail;
    let item;
    let user = await getUserViaEmailAndPopulateSaveLater(userEmail);
	console.log(user.saveForLater);
    for (let i in user.saveForLater) {
        if (user.saveForLater[i].productId.id == id) {
            item = user.saveForLater.splice(i, 1)[0];
            user.cart.items.push({
                productId: item.productId._id,
                qty: 1
            });
            req.session.quantity += 1;
            user.cart.totalPrice += item.productId.price;
            await user.save();
            res.send({ msg: "successfully added to cart", pid: id, item: item });
            break;
        }
    }
}

const getCheckout = async (req,res)=>{
	let userEmail = req.session.userEmail;
	let user = await getUserViaEmailAndPopulateCart(userEmail);
	let cartItems = user.cart.items;
	if(cartItems.length ===0 ){
		res.render("pages/cart",{data: data,error:"CART IS EMPTY! ADD PRODUCTS TO BUY!",products:{}});
	}
	result =[];
	for(let i in user.cart.items){
		let product = await getProductById(user.cart.items[i].productId.id);
		if([product]==null){
			res.render('/pages/cart',{error:"product no longer available! delete item"})
			return;
		}else if(product.qty<user.cart.items[i].qty){
			updateProductisAvailable(product)
			if(req.session.isAdmin){
				let data = {name:req.session.firstName, session: true,isAdmin:true}
					res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems,totalPrice:user.cart.totalPrice.toFixed(2),savedForLater:savedForLater});
				return ;
			}else{
				let data = {name:req.session.firstName, session: true,isAdmin:false}
					res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems,totalPrice:user.cart.totalPrice.toFixed(2),savedForLater:savedForLater});
				return;
			}	
		}else{
			result.push(user.cart.items[i])
		}
	}
	if(req.session.isAdmin){
			let data = {name:req.session.firstName, session: true,isAdmin:true}
			res.render("pages/checkout",{data:data,error:"",quantity:"",products:result,totalPrice:user.cart.totalPrice.toFixed(2)});
	}else{
			let data = {name:req.session.firstName, session: true,isAdmin:false}
			res.render("pages/checkout",{data:data,error:"",quantity:"",products:result,totalPrice:user.cart.totalPrice.toFixed(2)});
	}
}

module.exports = {
    increaseQuantityCart, decreaseQuantityCart, deleteItemCart, getCart, postSaveForLater, postAddFromSaveLater, getCheckout
}