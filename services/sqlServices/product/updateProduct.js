let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')


async function updateProduct(obj,pid) {
    try {
        let pool = await sql.connect(sqlConfig)
        //data in json not in object
        return await pool.request()
            .input('name',sql.VarChar,obj.name)
            .input('details',sql.VarChar,obj.details)
            .input('price',sql.Money,obj.price)
            .input('qty',sql.Int,obj.qty)
            .input('pid',sql.Int,pid)
            .query('update products set name = @name, details=@details, price= @price,quantity = @qty where id=@pid ')
            
    } catch (err) {
        console.log(err);
    }
}

async function updateIsAvailProduct(pid) {
    try {
        let pool = await sql.connect(sqlConfig)
        //data in json not in object
        return await pool.request()
            .input('pid',sql.Int,pid)
            .query('update products set isavailable = 0 where id=@pid ')
            
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    updateProduct,updateIsAvailProduct
}