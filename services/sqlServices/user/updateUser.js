
let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
async function updateUserVerify(email,token) {
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
        await pool.request()
            .input('email',sql.VarChar,email)
            .input('token',sql.BigInt,token)
            .query('update users set isverified = 1 where email = @email and token=@token')            
    } catch (err) {
        console.log(err);
    }
}

async function updateUserPassword(userID,password) {
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
        await pool.request()
            .input('userID',sql.Int,userID)
            .input('password',sql.VarChar,password)
            .query('update users set password = @password where userID = @userID')            
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    updateUserVerify,updateUserPassword
}