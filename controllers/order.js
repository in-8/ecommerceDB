//sql services
const {postAddress} = require('../services/sqlServices/orders/postAddress');
const {postPlaceOrder} = require('../services/sqlServices/orders/postOrder');
const {getCartItems,getCart,getCartProducts} = require('../services/sqlServices/cart/getCart');
const {getProduct} = require('../services/sqlServices/product/getProduct');
const Razorpay = require('razorpay')
var crypto = require("crypto");
const { log } = require('console');



const saveAddress = async (req,res)=>{
    await postAddress(req.session.UserID,req.body)
    res.redirect('/checkout')
}

const placeOrderCOD =async (req,res)=>{
    const {shipID} = req.params
    let cartItems = await getCartItems(req.session.cartID)
    cartItems = cartItems.recordset
    let userID = req.session.UserID
    await postPlaceOrder(userID,shipID,"COD",cartItems,req.session.cartID)
    let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin}
    res.redirect('/UserOrders');
}

const getOrderID = async(req,res)=>{

    let instance = new Razorpay({ key_id: process.env.razor_key_id, key_secret: process.env.razor_key_secret})
    // instance.orders.create({
    // amount: parseInt(req.body.bill)*100 ,
    // currency: "INR",
    // },function (err,order) {
    //     if (err) console.log(err);
    //     console.log(order);
    // })
    let order = await instance.orders.create({
        amount: parseInt(req.body.bill)*100 ,
        currency: "INR",
        })
    res.status(201).json(order)
}


const paymentVerify = async(req,res)=>{
    const{oid,shipID} = req.params
    const{razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body
    let body= oid + "|" +razorpay_payment_id;
    var generated_signature = crypto.createHmac('sha256', `${process.env.razor_key_secret}`)
                                    .update(body.toString())
                                    .digest('hex');
    if (generated_signature == razorpay_signature) {
        let cartItems = await getCartProducts(req.session.cartID)
        cartItems = cartItems.recordset
        //check stock
        for(let i in cartItems){
            if(cartItems[i].quantity<=0){
                    let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin,role:req.session.role}
                    res.render("pages/index",{data: data,error:"one of the items went out of stock during payment.amount will be refunded",products:result.recordset,quantity:0,numProds:4});
                    return;
            }else if(cartItems[i].qty>cartItems[i].quantity){
                    let data = {name:req.session.firstName, session: true, isAdmin:req.session.isAdmin,role:req.session.role}
                    res.render("pages/index",{data: data,error:"one of the items went out of stock during payment.amount will be refunded",products:result.recordset,quantity:0,numProds:4});
                    return;
            }
        }
        let userID = req.session.UserID
        await postPlaceOrder(userID,shipID,"online",cartItems,req.session.cartID,razorpay_order_id,razorpay_payment_id,razorpay_signature)
        res.redirect('/UserOrders')
    }else{
        res.send({signatureVerify:false})
    }
}


module.exports = {
    saveAddress,placeOrderCOD,getOrderID,paymentVerify
}


//learnings 
//we can render html in fetch too like i wasted lots of time with customising html and sending data on front end then 
//assemble but here we can just process and share
// ex   res.render('partials/successDiv',{error:"success bro"})
//in .then res jsut use res.text insstead of json
//https://stackoverflow.com/questions/36631762/returning-html-with-fetch