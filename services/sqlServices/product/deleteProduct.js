let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')

async function deleteProduct(pid) {
    try {
		//cascade is enabled

        let pool = await sql.connect(sqlConfig)
        await pool.request()
            .input("pid",sql.Int,pid)
            .query('delete from products where id =@pid')
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    deleteProduct
}