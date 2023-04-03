//another faster way of importing
const { Router } = require('express');
const router = Router();
const {getHomepage,loadMoreProducts,addToCart,logout,getUserOrders} = require('../controllers/home')
const checkAuth = require('../middlewares/checkAuth')
// router.use('/addToCart',checkAuth)
router.route('/').get(getHomepage)
router.route('/loadMoreProd/:count').get(loadMoreProducts)
router.route('/addToCart').post(checkAuth,addToCart)
router.route('/logout').get(logout)
router.route('/userOrders').get(checkAuth,getUserOrders)


module.exports = router