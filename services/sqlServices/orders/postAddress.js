let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')

async function postAddress(userID,obj) {
    try {
        let pool = await sql.connect(sqlConfig)
        if(obj.type ==''){
            obj.type = "Home";
        }
        return await pool.request()
            .input('userID',sql.Int,userID)
            .input('fullname',sql.VarChar,obj.fullname)
            .input('city',sql.VarChar,obj.city)
            .input('zip',sql.Int,obj.zip)
            .input('state',sql.VarChar,obj.state)
            .input('country',sql.VarChar,obj.country)
            .input('address',sql.VarChar,obj.address)
            .input('contact',sql.VarChar,obj.contact)
            .input('type',sql.VarChar,obj.type)
            .query('insert into address(userID,fullname,city,zip,state,country,address,contactNo,type) values (@userID,@fullname,@city,@zip,@state,@country,@address,@contact,@type) ')
            
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    postAddress
}
