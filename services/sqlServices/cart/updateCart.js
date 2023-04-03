let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')



//this single beautiful query does everything in one query which earlier was taking 2-3 queries 
//it calculates total price and quantity and updates it to the cart table and also returns the total price and quantity
async function updateTotals(userID,cartID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
        .input('cartID',sql.Int,cartID)
        .input('userID',sql.Int,userID)
        .query(' with temp as(select COALESCE(sum(qty),0) as totalQuantity,COALESCE(sum(qty*price),0) as totalPrice from cartItems join products on cartID = @cartID and cartitems.productid = products.id) update carts set carts.totalPrice = temp.totalPrice,carts.totalQuantity = temp.totalQuantity output inserted.totalPrice,inserted.totalQuantity from temp where userid = @userID')
    } catch (err) {
        console.log(err);
    }
}

async function updateQuantity(cartID,pid,qty) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
        .input('cartID',sql.Int,cartID)
        .input('pid',sql.Int,pid)
        .input('qty',sql.Int,qty)
        .query('update cartItems set qty = @qty where cartID=@cartID and productID = @pid')
    } catch (err) {
        console.log(err);
    }
}

async function updatetotalPriceAndQty(cartID,totalPrice,totalQuantity) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
        .query(`update carts set totalQuantity = ${totalQuantity},totalPrice = ${totalPrice} where cartID=${cartID}`)
    } catch (err) {
        console.log(err);
    }
}




module.exports = {
    updateTotals,updateQuantity,updatetotalPriceAndQty
}
