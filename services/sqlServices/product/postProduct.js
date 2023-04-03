let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')

async function saveProduct(data,filename,userID) {
    try {
        let pool = await sql.connect(sqlConfig)
        let obj= JSON.parse(data)
        return await pool.request()
            .input('name',sql.VarChar,obj.name)
            .input('details',sql.VarChar,obj.details)
            .input('price',sql.Money,obj.price)
            .input('qty',sql.Int,obj.quantity)
            .input('sellerid',sql.Int,userID)
            .input('url',sql.VarChar,filename)
            .query('insert into products(name,details,price,quantity,sellerid,image) values (@name,@details,@price,@qty,@sellerid,@url) ')
            
    } catch (err) {
        console.log(err);
    }
}


async function saveBulkProduct(userID,data) {
    try {
        const table = new sql.Table('products');
        table.create = true;
        // Ignore the identity field
        table.columns.add('name',sql.VarChar,{ nullable: false });
        table.columns.add('details',sql.VarChar(sql.MAX),{ nullable: false });
        table.columns.add('price',sql.Money,{ nullable: false });
        table.columns.add('quantity',sql.Int,{ nullable: false });
        table.columns.add('sellerid',sql.Int,{ nullable: false });
        table.columns.add('image',sql.VarChar(sql.MAX),{ nullable: false });
        
        for (let j = 0; j < data.length; j += 1) {
        table.rows.add(
        data[j].name,data[j].description,parseFloat(data[j].price),parseInt(data[j].quantity),parseInt(userID),data[j].image
        );
        }
        let pool = await sql.connect(sqlConfig)
        const request = pool.request();
        
        await request.bulk(table);
            
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    saveProduct,saveBulkProduct
}
