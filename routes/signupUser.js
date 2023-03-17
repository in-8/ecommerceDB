const express = require('express');
const router = express.Router();
const {signupUserGet,signupUserPost} = require('../controllers/signupUser')
router.route("/signup").get(signupUserGet).post(signupUserPost)
module.exports = router
