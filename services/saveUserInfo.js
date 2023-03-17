const{UserDB} = require("../database/schema");

async function saveUserSignup(req){
    const user = new UserDB();
    user.email = req.body.email;
    user.password = req.body.password;
    user.firstName = req.body.firstName,
    user.lastName = req.body.lastName;
    user.mobileNumber = req.body.mobileNumber,
    user.isVerified =false;
    user.token = Date.now();
    await user.save();
}

module.exports ={
    saveUserSignup
}