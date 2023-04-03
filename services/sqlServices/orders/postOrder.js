let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
//so here is the flow and lessson dont use callback really hard to  read and write 
//1st transaction begin and inserts order to orders
//in callback another transaction begins that updates qty and inserts to order items
//it was needed because for each orderid  i need cartitems by looping and only possible via this
//i am not using different transaction names since const blocked scoped and i am lazy to change each transaction name
//use async await instead or promises
// function postPlaceOrder(userID,shipID,payMethod,cartItems,cartID) {
//         sql.connect(sqlConfig, (err) => {
//             if (err) console.log(err);
//             const transaction = new sql.Transaction();
//             transaction.begin((err) => {
//                 if (err) console.log(err);

//                 const request = new sql.Request(transaction);
//                 request
//                 .input('userID',sql.Int,userID)
//                 .input('shipID',sql.Int,shipID)
//                 .input('payMethod',sql.VarChar,payMethod)
//                 .query(`insert into orders (userID,shipID,payMode) OUTPUT INSERTED.orderID values(@userID,@shipID,@payMethod)`
//                 ,(err,data) => {
//                     if (err) {
//                         console.log(err);
//                         transaction.rollback();
//                     } else {
//                         for(let i in cartItems){
//                             const transaction = new sql.Transaction();
//                             transaction.begin((err) => {
//                                 const request = new sql.Request(transaction);
//                                 request
//                                 .query(`update products set quantity-= ${cartItems[i].qty} where id=${cartItems[i].productID}`, (err) => {
//                                 if (err) {
//                                     console.log(err);
//                                     transaction.rollback();
//                                 } else {
//                                     request
//                                     .input('oid',sql.Int,data.recordset[0].orderID)
//                                     .input('pid',sql.Int,cartItems[i].productID)
//                                     .input('qty',sql.Int,cartItems[i].qty)
//                                     .query(`insert into orderItems  values(@oid,@pid,@qty)`, (err) => {
//                                         if (err) {
//                                             console.log(err);
//                                             transaction.rollback();
//                                         } else {
//                                             transaction.commit((err) => {
//                                             if (err) console.log(err);
//                                             });
//                                         }
//                                     });
//                                 }
//                                 });
//                             })
//                         }

//                     request
//                     .input("cartID",sql.Int,cartID)
//                     .query('delete from cartitems where cartID=@cartID',(err)=>{
//                         if (err) {
//                             console.log(err);
//                             transaction.rollback();
//                         } else {
//                             transaction.commit((err) => {
//                             if (err) console.log(err);
//                             });
//                         }
//                     })
//                     }
//                 });
//             });
//     });
// }

//version 2 upgraded 
async function postPlaceOrder(userID,shipID,payMethod,cartItems,cartID,razorpay_order_id,razorpay_payment_id,razorpay_signature) {
    try{
        let data;
        const dbConn = new sql.ConnectionPool(sqlConfig);
        await dbConn.connect();
        // const dbConn = await sql.connect(sqlConfig);
        // await dbConn.connect();
        const transaction = new sql.Transaction();
        try { 
            await new Promise(resolve => transaction.begin(resolve));
            // await transaction.begin();
            const request = new sql.Request(transaction);
            data = await request
            .input('userID',sql.Int,userID)
            .input('shipID',sql.Int,shipID)
            .input('payMethod',sql.VarChar,payMethod)
            .query(`insert into orders (userID,shipID,payMode) OUTPUT INSERTED.orderID values(@userID,@shipID,@payMethod)`)
            for(let i in cartItems){
            // const ctransaction = new sql.Transaction();
            // await new Promise(resolve => ctransaction.begin(resolve));
            try{
                    const request = new sql.Request(transaction);
                    await request
                            .query(`update products set quantity-= ${cartItems[i].qty} where id=${cartItems[i].productID}`)
                    await request
                            .input('oid',sql.BigInt,data.recordset[0].orderID)
                            .input('pid',sql.Int,cartItems[i].productID)
                            .input('qty',sql.Int,cartItems[i].qty)
                            .query(`insert into orderItems  values(@oid,@pid,@qty)`);
                }catch(err){
                console.log("inner error");
                console.log(err);
                // await ctransaction.rollback();
                await transaction.rollback();
            }
                // } finally{
                //     await ctransaction.commit();
                // }
            }
            await request
                    .input("cartID",sql.Int,cartID)
                    .query('delete from cartitems where cartID=@cartID')
            await request
            .input("roid",sql.VarChar,razorpay_order_id)
            .input("payid",sql.VarChar,razorpay_payment_id)
            .input("paysign",sql.VarChar,razorpay_signature)
            .input("oid",sql.BigInt,data.recordset[0].orderID)
            .query('insert into payments values(@oid,@roid,@payid,@paysign)')

            await transaction.commit();
            } catch (err) {
                console.log(err);
                await transaction.rollback();
                throw err;
            } finally {
                await dbConn.close();
                // return data.recordset[0].orderID
            }
    }catch(err){
        console.log(err);
    }
    }

module.exports = {
    postPlaceOrder
}
