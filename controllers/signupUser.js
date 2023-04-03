///send mail method
const sendMail = require("../methods/sendMail");
//mongodb service
// const {saveUserSignup} = require('../services/saveUserInfo')
// const {getUserViaEmail} = require('../services/getUser')
//sqlservices
const saveUser = require('../services/sqlServices/user/saveUser');
const {getUserViaEmail,getRoles} = require('../services/sqlServices/user/getUser');




const signupUserGet = (req, res) => {
    res.render("pages/signup",{error:""});
}

const signupUserPost = async (req,res)=>{
	const userEmail = req.body.email;
	// const foundUser =await getUserViaEmail(userEmail)
	const foundUser = await getUserViaEmail(userEmail);
	if(foundUser.recordset.length!=0){
		res.render("pages/signup",{error:"user already registered! please login"});
	}else{
		// await saveUserSignup(req)
		await saveUser(req);
		let user = await getUserViaEmail(userEmail)
		sendMail(userEmail,user.recordset[0].token,function(err,data)
		{
			res.render("pages/login",{error:"an email has been sent to registered email! \n please verify"});
		})
	}
}

//can optimize above signupuserpost like instead of read operation to check user exist add constraint on sql and if error render error or save 
//and proceed normally

const getUserRoles = async function(req,res){
	let roles = await getRoles();
	res.status(200).send(roles.recordset)
}
module.exports = {
    signupUserGet,signupUserPost,getUserRoles
}