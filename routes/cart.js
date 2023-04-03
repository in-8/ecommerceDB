const { Router } = require('express');
const router = Router();
const {increaseQuantityCart,decreaseQuantityCart,deleteItemCart,getCart, postSaveForLater,postAddFromSaveLater,getCheckout} = require("../controllers/cart")
const checkAuth = require('../middlewares/checkAuth')
router.route('/addItem/:id').post(checkAuth,increaseQuantityCart)
router.route('/decItem/:id').post(checkAuth,decreaseQuantityCart)
router.route('/deleteItem/:id').delete(checkAuth,deleteItemCart)
router.route('/cart').get(checkAuth,getCart)
router.route('/saveForLater/:id').post(checkAuth,postSaveForLater)
router.route('/addFromSaveLater/:id').post(checkAuth,postAddFromSaveLater)
router.route('/checkout').get(checkAuth,getCheckout)


module.exports = router