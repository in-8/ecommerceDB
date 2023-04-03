//anotehr option of importing
// const { Router } = require('express');
// const router = Router();

const express = require('express');
const router = express.Router();
const {loginUserGet,loginUserPost,verifyUser,forgotPasswordGet,forgotPasswordPost,
    resetPasswordGet,resetPasswordPost,resetPasswordGetViaMail} = require('../controllers/loginUser')

const checkAuth = require('../middlewares/checkAuth')

router.route("/").get(loginUserGet)
router.route("/").post(loginUserPost)
router.route('/verifyMail/:token/:email').get(verifyUser)
router.route('/forgotPassword').get(forgotPasswordGet).post(forgotPasswordPost)
router.route('/resetPassword/:token/:email').get(resetPasswordGetViaMail)
router.route('/resetPassword').get(checkAuth,resetPasswordGet)
router.route('/resetPassword').post(resetPasswordPost)
module.exports = router