const { Router } = require('express');
const router = Router();
const {saveAddress,placeOrderCOD,getOrderID,paymentVerify} = require("../controllers/order")
const checkAuth = require('../middlewares/checkAuth')
// router.use(checkAuth)
router.route('/saveAddress').post(checkAuth,saveAddress)
router.route('/placeOrderCOD/:shipID').post(checkAuth,placeOrderCOD)
router.route('/payment').post(checkAuth,getOrderID)
router.route('/paymentVerify/:oid/:shipID').post(checkAuth,paymentVerify)






module.exports = router