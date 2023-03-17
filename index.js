// optimize on read and write from db maybe use callback
//add middlewares for auth
//page not found check security
const express = require('express');
const session = require('express-session');
// let {}= require('./helpers');
const fs = require('fs');
const app = express();
const port = 3000;
const {main} = require("./database/init")
const{UserDB,ProductDB} = require("./database/schema");
let checkAuth = require("./middlewares/checkAuth");
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


//routes to api
const signupUserRoutes = require('./routes/signupUser')
const loginuUserRoutes = require('./routes/loginUser')
const homepageRoutes = require('./routes/home')
const adminRoutes = require('./routes/admin')
const cartRoutes = require('./routes/cart')

//default middleware for route api
// app.use("/signup",signupUserRoutes)
app.use(homepageRoutes)
app.use(signupUserRoutes)           //given two methods to set routes 1) go to signuproutes directly and search for api endpoint there or give one directory
app.use("/login",loginuUserRoutes)  // here and rest on router express smartly checks the defined endpoints
app.use(adminRoutes)
app.use(cartRoutes)

main().catch(err => console.log(err));


app.get('*',(req,res)=>{
    res.send("page not found :)");
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
})