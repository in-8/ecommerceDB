// optimize on read and write from db maybe use callback
const express = require('express');
const session = require('express-session');
// let {}= require('./helpers');
const fs = require('fs');
const app = express();
const port = 3000;
const sendMail = require("./methods/sendMail");
const sendResetMail = require("./methods/sendResetMail");
const {main} = require("./database/init")
const{UserDB,ProductDB} = require("./database/schema");
const multer = require('multer');
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
var path = require('path');
let checkAuth = require("./middlewares/checkAuth");
const { json } = require('express');
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(express.static("public"));
app.use(express.static("contents"));
app.use(express.static("uploads"));
app.set('view engine','ejs');
app.use(session({
	secret:'big boots',
	resave:false,
	saveUninitialized:true
}));


main().catch(err => console.log(err));


app.get('/', async (req,res)=>{
	if(req.session.is_logged_in){
		//implement added to cart feature if got time
		if(req.session.isAdmin){
			let result= await ProductDB.find().limit(4);
			let data = {name:req.session.firstName, session: true, isAdmin:true}
			let quantity = 0;
			let user = await UserDB.findOne({email: req.session.userEmail});
			for(let i in user.cart.items){
				quantity += user.cart.items[i].qty;
			}
			req.session.quantity = quantity
			res.render("pages/index",{data: data,error:"",products:result,numProds:4,quantity:quantity});
		}else{
			let result= await ProductDB.find().limit(4);
			let data = {name:req.session.firstName, session: true,isAdmin:false}
			let quantity = 0;
			let user = await UserDB.findOne({email: req.session.userEmail});
			for(let i in user.cart.items){
				quantity += user.cart.items[i].qty;
			}
			req.session.quantity = quantity
			res.render("pages/index",{data: data,error:"",products:result,numProds:4,quantity:quantity});
		}
	}else{

		let result= await ProductDB.find().limit(4);
		req.session.is_logged_in=false;
		let data = {name:"user", session: false,isAdmin:false}
		res.render("pages/index",{data: data,error:"",products:result,numProds:4,quantity:0,next4Products:8});
	}
})

app.get('/verifyMail/:token/:email',async function(req,res){	
	const {token,email} = req.params;
	const verifyCheck = await UserDB.findOne({email:email,token:token})
	if(verifyCheck){
		await UserDB.updateOne({email:email,token:token},{isVerified:true})
		req.session.firstName=verifyCheck.firstName;
		if(req.session.userEmail){
			req.session.isVerified = true;
			res.redirect('/')
		}else{
			req.session.is_logged_in = true;
			req.session.isVerified=true;
			req.session.firstName = verifyCheck.firstName;
			res.redirect('/');
		}
	}else{
		res.render("pages/login",{error:"invalid token contact admin"});
	}			
})

app.route('/login').get( (req, res) => {
    res.render("pages/login",{error:""});
})
.post(async (req,res)=>{
	const user = await UserDB.findOne({email:req.body.email,password:req.body.password})
			if(user){
				req.session.is_logged_in=true;
				req.session.isVerified=user.isVerified
				req.session.firstName = user.firstName;
				req.session.userEmail = user.email;
				req.session.isAdmin = user.isAdmin;
				res.redirect('/');
			}else{
				res.render("pages/login",{error:"user doesnt exist! please signup!"});
			}
	})

app.route('/signup').get( (req, res) => {
    res.render("pages/signup",{error:""});
})
.post(async (req,res)=>{
	const foundUser = await UserDB.findOne({email:req.body.email})
	if(foundUser){
		res.render("pages/signup",{error:"user already registered! please login"});
	}else{
		const user = new UserDB();
		user.email = req.body.email;
		user.password = req.body.password;
		user.firstName = req.body.firstName,
		user.lastName = req.body.lastName;
		user.mobileNumber = req.body.mobileNumber,
		user.isVerified =false;
		user.token = Date.now();
		user.isAdmin = false; // for now manually verify admin
		await user.save();
		sendMail(req.body.email,user.token,function(err,data)
		{
			req.session.is_logged_in = true;
			req.session.userEmail = req.body.email; 
			// req.session.isVerified = false;
			req.session.firstName = req.body.firstName;
			res.render("pages/login",{error:"an email has been sent to registered email! \n please verify"});
		})
		// res.redirect("/login");
	}
})

app.route('/forgotPassword').get((req,res)=>{
	res.render("pages/forgotPassword",{error:""});
})
.post(async (req,res)=>{
	const user = await UserDB.findOne({email:req.body.email})
	if(user){
		sendResetMail(user.email,user.token,function(err,data)
		{
			res.render("pages/forgotPassword",{error:"an email has been sent to registered email!\n click on it to reset it!"});
		})
	}else{
		res.render("pages/forgotPassword",{error:"email doesnt exist in our database! check your email!"});
	}
	})


app.route('/resetPassword/:token/:email').get(async (req,res)=>{
	const {email,token} = req.params;
	let user = await UserDB.findOne({email:email,token:token})
	if(user){
		req.session.is_logged_in = true;
		req.session.userEmail = email;
		req.session.firstName=user.firstName;
		res.render("pages/resetPassword",{error:""});
	}else{
		res.render('/pages/login',{error:"invalid token "})
	}
})

app.post('/resetPassword',async (req,res)=>{
	if(req.body.password === req.body.cnfPassword){
		const email = req.session.userEmail;
		await UserDB.updateOne({email:email},{password:req.body.cnfPassword})
		res.redirect('/');
	}else{
		res.render("pages/resetPassword",{error:"passwords do not match"});
	}
})

app.route('/admin').get(async (req,res)=>{
	//add session check
	if(req.session.is_logged_in && req.session.isAdmin){
	let result= await ProductDB.find().limit(4);
	let data = {name:req.session.firstName, session: true, isAdmin:true}
	let quantity = 0 ;
	res.render("pages/admin",{data: data,error:"",products:result,numProds:4,quantity:0});
	}else{
		res.render("pages/login",{error:"unauthorized! login with valid credentials!"})
	}
})

app.get('/loadMoreProd/:count', async (req,res)=>{
		let numProd = parseInt(req.params.count);
		// let totalProduct = await ProductDB.count();
		let result = await ProductDB.find().skip(numProd).limit(4);
		let next4Product = parseInt(numProd)+4;
		res.send({result, next4Products:next4Product});
	})

app.route('/addToCart').post(async (req,res)=>{  //remember query parameter and router pareameter are different her i use query string and in send email i used rel parameter
	if(req.session.is_logged_in){
		let {id} = req.query; 
		let userEmail = req.session.userEmail;
		let user = await UserDB.find({email:userEmail});
		let userCart =user[0].cart;
		let product = await ProductDB.findById(id);
		userCart.items.push({
			productId:product._id,
			qty:1
		})
		req.session.quantity +=1;
		if(!userCart.totalPrice){
			userCart.totalPrice =0; 
		}
		userCart.totalPrice+= product.price;
		await UserDB.findOneAndUpdate({email:userEmail},{cart:userCart})
		res.json({ quantity:req.session.quantity});
		}
		else{
		res.redirect(307,"/login");
		}
})

//use better modular middleware syntax https://stackoverflow.com/questions/31928417/chaining-multiple-pieces-of-middleware-for-specific-route-in-expressjs
app.post('/addNewProduct', async (req,res)=>{
	upload(req, res, async function (err) {
		if (err instanceof multer.MulterError) {
		  // A Multer error occurred when uploading.
			res.status(400).send({msg:err})
		} else if (err) {
		  // An unknown error occu
		  res.status(400).send()
		}else{
			// console.log(req.file)
			// Everything went fine.
			const prodcut = new ProductDB();
			let obj = JSON.parse(req.body.obj);
			// console.log(obj.quantity);
			prodcut.qty = obj.quantity;
			prodcut.name = obj.name;
			prodcut.image = req.file.filename;
			prodcut.price = obj.price;
			prodcut.details = obj.details;
			await prodcut.save();
			res.status(200).send({msg:"Product added successfully"})
		}
		})
	})

app.post('/updateProduct',async (req,res)=>{
	let {id} = req.query
	await ProductDB.findByIdAndUpdate(id,{
		qty:req.body.qty,
		name:req.body.name,
		price: req.body.price,
		details:req.body.details
	})
	res.sendStatus(200)
})

//deletes item from users cart 
app.delete('/deleteItem/:id', async (req,res)=>{
	const {id} = req.params;
	const userEmail = req.session.userEmail
	let user = await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.totalPrice -= (cart.items[i].productId.price)*(cart.items[i].qty);
			req.session.quantity -= cart.items[i].qty;
			cart.items.pop(i);
			await UserDB.findOneAndUpdate({email:userEmail},{cart:cart})
			res.sendStatus(200)
		};
	}
})

//deletes item/prodcut from database
app.post('/deleteProduct', async (req,res)=>{
	const {id} = req.query;
	await ProductDB.findByIdAndDelete(id)
	res.sendStatus(200)
})
app.post('/addItem/:id', async (req,res)=>{
	const {id} = req.params;
	const userEmail = req.session.userEmail
	let user = await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.items[i].qty +=1;
			req.session.quantity += 1;
			cart.totalPrice+=cart.items[i].productId.price;
			await UserDB.findOneAndUpdate({email:userEmail},{cart:cart})
			res.send({ quantity:cart.items[i].qty})
		};
	}
})

app.post('/decItem/:id', async (req,res)=>{
	const {id} = req.params;
	const userEmail = req.session.userEmail
	let user = await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
	let cart = user.cart;
	for(let i in cart.items){
		if(cart.items[i].productId.id == id){
			cart.items[i].qty -=1;
			req.session.quantity -= cart.items[i].qty;
			cart.totalPrice-=cart.items[i].productId.price;
			await UserDB.findOneAndUpdate({email:userEmail},{cart:cart})
			res.send({ quantity:cart.items[i].qty})
		};
	}
})

app.route('/cart').get( async (req,res)=>{
	if(!req.session.is_logged_in){
		res.render('pages/login',{error:"please login first"})	
	}else{
		if(req.session.isAdmin){
			const userEmail = req.session.userEmail
			let user = await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
			let cartItems = user.cart.items;
			let data = {name:req.session.firstName, session: true,isAdmin:true}
			if(cartItems.length ===0 ){
				res.render("pages/cart",{data: data,error:"CART IS EMPTY! ADD PRODUCTS TO BUY!",products:{},quantity:""});
			}else{
				res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems});
			}
		}else{
			const userEmail = req.session.userEmail
			let user = await UserDB.findOne({email:userEmail}).populate('cart.items.productId');
			let cartItems = user.cart.items;
			let data = {name:req.session.firstName, session: true,isAdmin:false}
			if(cartItems.length ===0 ){
				res.render("pages/cart",{data: data,error:"CART IS EMPTY! ADD PRODUCTS TO BUY!",products:{},quantity:""});
			}else{
				res.render("pages/cart",{data:data,error:"",quantity:"",products:cartItems});
			}
		}
	}
})

app.get('/logout',(req,res)=>{
	req.session.destroy();
	res.redirect("/login")
})


app.get('*',(req,res)=>{
    res.sendStatus(404);
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
})