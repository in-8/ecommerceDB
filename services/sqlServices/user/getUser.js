
let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
async function getUserViaEmail(email) {
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
        return await pool.request()
            .input('email', sql.VarChar, email)
            .query('select * from users left join roles on roles.roleid =users.role where email = @email')
    } catch (err) {
        console.log(err);
    }
}

async function getUserViaUserID(userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
        return await pool.request()
            .input('userID', sql.Int, userID)
            .query('select * from users where userID = @userID')
    } catch (err) {
        console.log(err);
    }
}

async function getRoles(){
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
        return await pool.request()
            .query('select * from roles')
    }catch (err) {
        console.log(err);
    }
}


module.exports = {
    getUserViaEmail,getUserViaUserID,getRoles
}

