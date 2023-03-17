///send mail method
const sendMail = require("../methods/sendMail");
//db service
const {saveUserSignup} = require('../services/saveUserInfo')
const {getUserViaEmail} = require('../services/getUser')


const signupUserGet = (req, res) => {
    res.render("pages/signup",{error:""});
}

const signupUserPost = async (req,res)=>{
	const userEmail = req.body.email;
	const foundUser =await getUserViaEmail(userEmail)
	if(foundUser){
		res.render("pages/signup",{error:"user already registered! please login"});
	}else{
		await saveUserSignup(req)
		let user = await getUserViaEmail(userEmail)
		sendMail(req.body.email,user.token,function(err,data)
		{
			req.session.is_logged_in = true;
			req.session.userEmail = req.body.email; 
			req.session.firstName = req.body.firstName;
			res.render("pages/login",{error:"an email has been sent to registered email! \n please verify"});
		})
	}
}

module.exports = {
    signupUserGet,signupUserPost
}