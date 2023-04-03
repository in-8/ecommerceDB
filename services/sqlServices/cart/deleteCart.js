let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig');
const { updateTotals } = require("./updateCart");

async function deleteItemFromCartItems(cartID,PID,userID){
    try{
        let pool = await sql.connect(sqlConfig)
        let output = await pool.request()
        .input('cartID',sql.Int,cartID)
        .input('PID',sql.Int,PID)
        .query('delete from cartitems where cartID = @cartID and productID = @PID ')
        //update total price & qty in cart
        let totals = await updateTotals(userID,cartID)
        return totals.recordset[0]
    }catch(err){
        console.log(err);
    }
}

async function deleteFromSaveLater(userID,PID){
    try{
        let pool = await sql.connect(sqlConfig)
        await pool.request()
        .input('userID',sql.Int,userID)
        .input('PID',sql.Int,PID)
        .query('delete from saveForLater where userID = @userID and productID = @PID')
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    deleteItemFromCartItems,deleteFromSaveLater
}