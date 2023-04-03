let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')


async function getCartID(UserID) {
    try {
        let pool = await sql.connect(sqlConfig)
        let cartID= await pool.request()
            .input('UserID',sql.Int,UserID)
            .query('select * from carts where userID = @UserID ')
        if(cartID.recordset.length ==0){
            await pool.request()
            .input('UserID',sql.Int,UserID)
            .query('insert into carts(userID) values (@UserID) ')
            let newCartID= await pool.request()
            .input('UserID',sql.Int,UserID)
            .query('select * from carts where userID = @UserID ')
            return newCartID
        }else{
            return cartID
        }
    } catch (err) {
        console.log(err);
    }
}


async function getCartProducts(cartID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('cartID',sql.Int,cartID)
            .query('select * from cartItems join products on cartID = @cartID and cartitems.productid = products.id ')
    }catch (err) {
        console.log(err);
    }
}

async function getCartItems(cartID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('cartID',sql.Int,cartID)
            .query('select * from cartItems where cartID = @cartID')
    }catch (err) {
        console.log(err);
    }
}

async function getTotals(cartID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('cartID',sql.Int,cartID)
            .query('select COALESCE(sum(qty),0) as totalQuantity,COALESCE(sum(qty*price),0) as totalPrice from cartItems join products on cartID = @cartID and cartitems.productid = products.id')
    }catch (err) {
        console.log(err);
    }
}


async function getSaveForLater(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('userID',sql.Int,userID)
            .query('select * from saveForLater left join products on userID=@userID and saveForLater.productid = products.id ')
    } catch (err) {
        console.log(err);
    }
}

async function checkProductInSaveForLater(userID,PID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('userID',sql.Int,userID)
            .input('PID',sql.Int,PID)
            .query('select * from saveForLater where userID= @userID and productID=@PID ')
    } catch (err) {
        console.log(err);
    }
}

async function checkProductInCartItems(cartID,PID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('cartID',sql.Int,cartID)
            .input('PID',sql.Int,PID)
            .query('select * from cartItems where cartID= @cartID and productID=@PID ')
    } catch (err) {
        console.log(err);
    }
}

async function getCart(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input('userID',sql.Int,userID)
            .query('select * from carts where userID = @userID')
    }catch (err) {
        console.log(err);
    }
}


module.exports ={
    getCartID,getCartProducts,getSaveForLater,checkProductInSaveForLater,checkProductInCartItems,getTotals,getCartItems,getCart
}
