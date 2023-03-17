function checkAdmin(req,res,next){
    if(req.session.isAdmin){
        next();
        return;
    }
    res.render("pages/login",{error:"unauthorized!No admin permission"})
}

module.exports = checkAdmin