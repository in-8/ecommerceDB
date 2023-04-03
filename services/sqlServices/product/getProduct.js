let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
async function getProduct() {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .query('select top 4 * from products')
    } catch (err) {
        console.log(err);
    }
}

async function getSellerProduct(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("userID",sql.Int,userID)
            .query('select top 4 * from products where sellerID = @userID')
    } catch (err) {
        console.log(err);
    }
}



async function getNextProduct(skipProductCount) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .query(`select * from products ORDER BY id OFFSET ${skipProductCount} ROWS FETCH NEXT 4 ROWS ONLY`)
    } catch (err) {
        console.log(err);
    }
}


async function getNextSellerProduct(userID,skipProductCount) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("userID",sql.Int,userID)
            .query(`select * from products where sellerID = @userID ORDER BY id OFFSET ${skipProductCount} ROWS FETCH NEXT 4 ROWS ONLY `)
    } catch (err) {
        console.log(err);
    }
}

async function getProductById(id) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("pid",sql.Int,id)
            .query(`select * from products where id = @pid`)
    } catch (err) {
        console.log(err);
    }
}

module.exports ={
    getProduct,getNextProduct,getProductById,getSellerProduct,getNextSellerProduct
}