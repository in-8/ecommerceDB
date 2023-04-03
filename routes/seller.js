const { Router } = require('express');
const router = Router();
const {adminAddNewProduct, adminUpdateProduct, adminDeleteProduct} = require('../controllers/admin')
const {getSeller,loadMoreProducts,getSellerOrders} = require('../controllers/seller')
const {postBulkProduct} = require('../controllers/seller')
const checkAuth = require('../middlewares/checkAuth')
const checkSeller = require('../middlewares/checkSeller')
router.route('/').get(checkAuth,checkSeller,getSeller);
router.route('/loadMoreProd/:count').get(checkAuth,checkSeller,loadMoreProducts)
//reusing admin controllers because functionality is same  
router.route('/addNewProduct').post(checkAuth,checkSeller,adminAddNewProduct)
router.route('/addBulkProduct').post(checkAuth,checkSeller,postBulkProduct)
router.route('/updateProduct').post(checkAuth,checkSeller,adminUpdateProduct)
router.route('/deleteProduct').post(checkAuth,checkSeller,adminDeleteProduct)
router.route('/orders').get(checkAuth,checkSeller,getSellerOrders)



module.exports = router