const { Router } = require('express');
const router = Router();
const {increaseQuantityCart,decreaseQuantityCart,deleteItemCart,getCart, postSaveForLater,postAddFromSaveLater,getCheckout} = require("../controllers/cart")
const checkAuth = require('../middlewares/checkAuth')
router.use(checkAuth)
router.route('/addItem/:id').post(increaseQuantityCart)
router.route('/decItem/:id').post(decreaseQuantityCart)
router.route('/deleteItem/:id').delete(deleteItemCart)
router.route('/cart').get(checkAuth,getCart)
router.route('/saveForLater/:id').post(postSaveForLater)
router.route('/addFromSaveLater/:id').post(postAddFromSaveLater)
router.route('/checkout').get(getCheckout)


module.exports = router