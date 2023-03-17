const { Router } = require('express');
const router = Router();
const {getAdmin, adminAddNewProduct, adminUpdateProduct, adminDeleteProduct} = require('../controllers/admin')
const checkAuth = require('../middlewares/checkAuth')
const checkAdmin = require('../middlewares/checkAdmin')
router.route('/admin').get(checkAuth,checkAdmin,getAdmin);
router.route('/addNewProduct').post(checkAuth,checkAdmin,adminAddNewProduct)
router.route('/updateProduct').post(checkAuth,checkAdmin,adminUpdateProduct)
router.route('/deleteProduct').post(checkAuth,checkAdmin,adminDeleteProduct)


module.exports = router
