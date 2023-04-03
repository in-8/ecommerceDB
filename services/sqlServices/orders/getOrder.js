let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')


async function getOrderItems(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("userID",sql.Int,userID)
            .query(`select o.orderStatus,o.payMode,p.name,p.image,(p.price*oi.quantity)as price,CONVERT(date,o.createdAt, 101)as date from (select orderStatus,payMode,orderID,createdAt from orders where userID = @userID) o join orderItems oi on o.orderID = oi.orderID join products p on oi.productID = p.id order by o.createdAt desc`)
    } catch (err) {
        console.log(err);
    }
}

async function getSellerOrderItems(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("userID",sql.Int,userID)
            .query(`select oi.quantity,p.name,p.id,p.image,oi.orderID,(p.price *oi.quantity)as amount,o.createdAt,o.orderID,o.orderStatus,o.payMode,o.shipID,a.* from orderItems oi join products p on p.id = oi.productID and p.sellerid = @userID join orders o on o.orderID = oi.orderID join address a on o.shipID = a.shipID order by o.createdAt desc`)
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getOrderItems,getSellerOrderItems
}