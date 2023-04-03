
let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
module.exports = async function saveUser(req) {
    try {
        let pool = await sql.connect(sqlConfig)
        console.log("connected");
            await pool.request()
            .input('fname', sql.VarChar, req.body.firstName)
            .input('lname',sql.VarChar, req.body.lastName)
            .input('email',sql.VarChar, req.body.email)
            .input('password',sql.VarChar, req.body.password)
            .input('mobileNumber',sql.VarChar, req.body.mobileNumber)
            .input('token',sql.BigInt,Date.now())
            .input('roleid',sql.SmallInt,req.body.roleid)
            .query('insert into users(fname,lname,email,password,mobilenumber,token,role)values(@fname,@lname,@email,@password,@mobileNumber,@token,@roleid)')

        
    } catch (err) {
        console.log(err);
    }
}