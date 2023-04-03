function checkSeller(req,res,next){
    if(req.session.role==3){
        next();
        return;
    }else if(req.headers.type =="fetch" & !req.session.is_logged_in){
        // console.log("here");
        // res.status(304)
        res.redirect('/login')
    }
    res.render("pages/login",{error:"unauthorized!No permission"})
}

module.exports = checkSeller