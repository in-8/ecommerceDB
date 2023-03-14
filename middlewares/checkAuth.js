function checkAuth(req,res,next){
    if(req.session.is_logged_in){
        next();
        return;
    }

    res.redirect('/login');
}

module.exports = checkAuth;