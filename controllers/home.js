const{UserDB,ProductDB} = require("../database/schema");
const {getUserViaEmail,getUserViaEmailPassword,getUserViaEmailToken} = require("../services/getUser")
const {getproduct,getNextProduct,getProductById} = require("../services/getProduct")
const {findViaEmailAndUpdateCart} = require("../services/updateUser")
const getHomepage = async (req,res)=>{
	if(req.session.is_logged_in){
		let result= await getproduct()
		let quantity = 0;
		let user = await getUserViaEmail(req.session.userEmail)
		for(let i in user.cart.items){
			quantity += user.cart.items[i].qty;
		}
		req.session.quantity = quantity
		if(req.session.isAdmin){
			let data = {name:req.session.firstName, session: true, isAdmin:true}
			res.render("pages/index",{data: data,error:"",products:result,quantity:quantity,numProds:4});
		}else{
			let data = {name:req.session.firstName, session: true,isAdmin:false}
			res.render("pages/index",{data: data,error:"",products:result,quantity:quantity,numProds:4});
		}
	}else{
		let result= await getproduct()
		req.session.is_logged_in=false;
		let data = {name:"user", session: false,isAdmin:false}
		res.render("pages/index",{data: data,error:"",products:result,quantity:0,numProds:4});
	}
}
//change session storage if you want to change number of product loaded along with numberes here
const loadMoreProducts =  async (req,res)=>{
    let skipProductCount = parseInt(req.params.count);
    let result = await getNextProduct(skipProductCount);
    res.send({result, nextProductCount:(skipProductCount+4)});
}

const addToCart = async (req,res)=>{  //remember query parameter and router pareameter are different her i use query string and in send email i used rel parameter
		let {id} = req.query; 
		let user = await getUserViaEmail(req.session.userEmail)
		let userCart =user.cart;
		let product = await getProductById(id)
		userCart.items.push({
			productId:product._id,
			qty:1
		})
		req.session.quantity +=1;
		userCart.totalPrice+= product.price;
		await findViaEmailAndUpdateCart(req.session.userEmail,userCart)
		res.json({ quantity:req.session.quantity});
}

const logout = (req,res)=>{
	req.session.destroy();
	res.redirect("/login")
}
module.exports = {
    getHomepage,loadMoreProducts,addToCart,logout
}