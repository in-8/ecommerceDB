const express = require('express');
const router = express.Router();
const {signupUserGet,signupUserPost,getUserRoles} = require('../controllers/signupUser')

router.route("/signup").get(signupUserGet).post(signupUserPost);
router.route("/getRoles").get(getUserRoles);
module.exports = router
