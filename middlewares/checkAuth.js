function checkAuth(req,res,next){
    if(req.session.is_logged_in){
        next();
        return;
    }else if(req.headers.type =="fetch" & !req.session.is_logged_in){
        // console.log("here");
        // res.status(304)
        res.redirect('/login')
    }else{
        res.render('pages/login',{error:"please login first"});
    }
    // res.redirect('/login')
}

module.exports = checkAuth

//use better modular middleware syntax https://stackoverflow.com/questions/31928417/chaining-multiple-pieces-of-middleware-for-specific-route-in-expressj