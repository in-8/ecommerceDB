let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')


async function getAddress(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        return await pool.request()
            .input("userID",sql.Int,userID)
            .query(`select * from address where userID = @userID`)
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getAddress
}