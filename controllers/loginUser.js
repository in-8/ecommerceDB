const{UserDB} = require("../database/schema");
const sendResetMail = require("../methods/sendResetMail");
const {getUserViaEmail,getUserViaEmailPassword,getUserViaEmailToken} = require("../services/getUser")
const{updateUserVerify,updateUserPassword} = require("../services/updateUser")


const loginUserGet= (req, res) => {
	res.render("pages/login",{error:""});
}


const loginUserPost = async (req,res)=>{
	let email = req.body.email
	let password = req.body.password
	const user = await getUserViaEmailPassword(email,password)
			if(user){
				req.session.is_logged_in=true;
				req.session.isVerified=user.isVerified
				req.session.firstName = user.firstName;
				req.session.userEmail = user.email;
				req.session.isAdmin = user.isAdmin;
				res.redirect('/');
			}else{
				res.render("pages/login",{error:"please check your email or password entered correctly"});
			}
	}

const verifyUser = async function(req,res){	
	const userEmail = req.params.email;
	const userToken = req.params.token;
	const user = await getUserViaEmailToken(userEmail,userToken)
	if(user){
		await updateUserVerify(userEmail,userToken);
		req.session.firstName=user.firstName;
		if(req.session.userEmail){
			req.session.isVerified = true;
			res.redirect('/')
		}else{
			req.session.is_logged_in = true;
			req.session.isVerified=true;
			req.session.firstName = user.firstName;
			res.redirect('/');
		}
	}else{
		res.render("pages/login",{error:"invalid token contact admin"});
	}			
}

const forgotPasswordGet = (req,res)=>{
	res.render("pages/forgotPassword",{error:""});
}

const forgotPasswordPost = async (req,res)=>{
	const user = await getUserViaEmail(req.body.email)
	if(user){
		sendResetMail(user.email,user.token,function(err,data)
		{
			res.render("pages/forgotPassword",{error:"an email has been sent to registered email!\n click on it to reset it!"});
		})
	}else{
		res.render("pages/forgotPassword",{error:"email doesnt exist in our database! check your email!"});
	}
	}

const resetPasswordGetViaMail = async (req,res)=>{
	const {email,token} = req.params;
	let user = await getUserViaEmailToken(email,token)
	if(user){
		req.session.is_logged_in = true;
		req.session.userEmail = email;
		req.session.firstName=user.firstName;
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
		const email = req.session.userEmail;
		await updateUserPassword(email,req.body.cnfPassword)
		res.redirect('/');
	}else{
		res.render("pages/resetPassword",{error:"passwords do not match"});
	}
}

module.exports = {
	loginUserGet,loginUserPost,verifyUser,forgotPasswordGet,forgotPasswordPost,resetPasswordGet,
	resetPasswordGetViaMail,resetPasswordPost
}