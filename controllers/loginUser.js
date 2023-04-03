// const{UserDB} = require("../database/schema");
const sendResetMail = require("../methods/sendResetMail");
// const {getUserViaEmail,getUserViaEmailPassword,getUserViaEmailToken} = require("../services/getUser")
// const{updateUserVerify,updateUserPassword} = require("../services/updateUser")
//sqlservices
const {updateUserVerify,updateUserPassword} = require('../services/sqlServices/user/updateUser');
const {getUserViaEmail,getUserViaUserID} = require('../services/sqlServices/user/getUser');
const { user } = require("../database/dbconfig");
const loginUserGet= (req, res) => {
	res.render("pages/login",{error:""});
}


const loginUserPost = async (req,res)=>{
	let email = req.body.email
	let password = req.body.password
	const user = await getUserViaEmail(email)
	if(user.recordset.length ==0){
		res.render("pages/login",{error:"user doesnt exist please signup"});
	}else{
		if(user.recordset[0].password == password){
			req.session.is_logged_in=true;
			req.session.isVerified=user.recordset[0].isVerified
			req.session.firstName = user.recordset[0].Fname;
			req.session.userEmail = email;
			req.session.isAdmin = user.recordset[0].isAdmin;
			req.session.UserID = user.recordset[0].UserID;
			req.session.role = user.recordset[0].role;
			res.redirect('/');
		}else{
			res.render("pages/login",{error:"please check your email or password entered correctly"});
		}
	}}
//use user id dont expose email
const verifyUser = async function(req,res){	
	const userEmail = req.params.email;
	const userToken = req.params.token;
	const user = await getUserViaEmail(userEmail)
	if(user){
		await updateUserVerify(userEmail,userToken);
			req.session.userEmail=userEmail
			req.session.is_logged_in = true;
			req.session.isVerified=true;
			req.session.firstName = user.recordset[0].Fname;
			res.redirect('/');
	}else{
		res.render("pages/login",{error:"invalid token/user contact admin"});
	}			
}

const forgotPasswordGet = (req,res)=>{
	res.render("pages/forgotPassword",{error:""});
}

const forgotPasswordPost = async (req,res)=>{
	const user = await getUserViaUserID(req.body.UserID)
	if(user){
		sendResetMail(req.session.userEmail,user.recordset[0].token,function(err,data)
		{
			res.render("pages/forgotPassword",{error:"an email has been sent to registered email!\n click on it to reset it!"});
		})
	}else{
		res.render("pages/forgotPassword",{error:"email doesnt exist in our database! check your email!"});
	}
	}

const resetPasswordGetViaMail = async (req,res)=>{
	const {email,token} = req.params;
	let user = await getUserViaEmail(email);
	if(user.recordset[0].token == token){
		req.session.is_logged_in = true;
		req.session.userEmail = email;
		req.session.UserID = user.recordset[0].UserID;
		req.session.firstName=user.recordset[0].Fname;
		res.render("pages/resetPassword",{error:""});
	}else{
		res.render('/pages/login',{error:"invalid token "})
	}
}

const resetPasswordGet = async (req,res)=>{
	res.render("pages/resetPassword",{error:""});
}

const resetPasswordPost = async (req,res)=>{
	if(req.body.password === req.body.cnfPassword){
		const UserID = req.session.UserID;
		await updateUserPassword(UserID,req.body.cnfPassword)
		res.redirect('/');
	}else{
		res.render("pages/resetPassword",{error:"passwords do not match"});
	}
}

module.exports = {
	loginUserGet,loginUserPost,verifyUser,forgotPasswordGet,forgotPasswordPost,resetPasswordGet,
	resetPasswordGetViaMail,resetPasswordPost
}