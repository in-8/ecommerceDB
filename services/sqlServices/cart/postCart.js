//commented out my past mistakes to learn from it

let sql = require("mssql");
const sqlConfig = require('../../../database/dbconfig')
const {deleteItemFromCartItems} = require('../cart/deleteCart')
const {updateTotals} = require('../cart/updateCart')
const {getTotals} = require('../cart/getCart')


async function saveCart(cartID,PID) {
    try {
        let pool = await sql.connect(sqlConfig)
        await pool.request()
            .input('cartID',sql.Int,cartID)
            .input('PID',sql.Int,PID)
            .query('insert into cartItems(cartID,productID) values (@cartID,@PID) ')
        //now no longer needeed to update price will update on getting cart
        //get product price
        // let product = await pool.request()
        //     .input('pid',sql.Int,PID)
        //     .query('select * from products where id=@pid');
        // let price= product.recordset[0].price
        //update total price and qty
        // await pool.request()
        //     .input('userID',sql.Int,userID)
        //     .input('price',sql.Money,price)
        //     .query('update carts set totalPrice += @price,totalQuantity+=1 where userid = @userID')
        //updateTotals(userID,cartID)
            
    } catch (err) {
        console.log(err);
    }
}
//optimisations to make it faster 2 less queries & connection
//first filtered and then joined so no need to fetch product details again
//used sql feature of output to output updated value 
//make it a transaction
//made optimised get total query
async function saveForLater(userID,PID,cartID) {
    try {
        let pool = await sql.connect(sqlConfig)
        //get qty
        let cartitem = await pool.request()
        .input('cartID',sql.Int,cartID)
        .input('pid',sql.Int,PID)
        .query('select * from cartItems join products on cartid=@cartID and productID= @pid and products.id = cartitems.productID ');
        let qty = cartitem.recordset[0].qty
        //add to save later
        await pool.request()
            .input('userID',sql.Int,userID)
            .input('PID',sql.Int,PID)
            .input('qty',sql.Int,qty)
            .query('insert into saveforlater values (@userID,@PID,@qty) ')
        //update total price & qty in cart
        // let result = await pool.request()
        //     .input('userID',sql.Int,userID)
        //     .input('price',sql.Money,price)
        //     .input('qty',sql.Int,qty)
        //     .query('update carts set totalPrice -= @price,totalQuantity -= @qty output inserted.totalPrice where userid = @userID ');
        //delete from cartitems
        await deleteItemFromCartItems(cartID,PID)
        //get total price via optimized update query or can use gettotals
        let totals =await updateTotals(userID,cartID);
        let obj={
            product:cartitem.recordset[0],
            totalPrice: totals.recordset[0].totalPrice,
            totalQuantity: totals.recordset[0].totalQuantity,
        }
        return obj;
    } catch (err) {
        console.log(err);
    }
}

async function postIncreaseQuantityCart(cartID,PID) {
    try {
        //query below joins then updates qty then returns desired fields
        let pool = await sql.connect(sqlConfig)
        const result = await pool.request()
            .input('cartID',sql.Int,cartID)
            .input('PID',sql.Int,PID)
            .query('UPDATE cartItems SET cartitems.qty+=1 output inserted.qty as qty,p.price as price FROM cartItems c INNER JOIN products p ON cartID= @cartID and productID= @pid  and  c.productID = p.id;')
        //get product price
        // let product = await pool.request()
        //     .input('pid',sql.Int,PID)
        //     .query('select * from products where id=@pid');
        // let price= product.recordset[0].price
        //update total price and qty
        // let total = await pool.request()
        //     .input('userID',sql.Int,userID)
        //     .input('price',sql.Money,price)
        //     .query('update carts set totalPrice += @price,totalQuantity+=1 output inserted.totalPrice,inserted.totalQuantity where userid = @userID')
        let totals = await getTotals(cartID)
        let obj={
            qty:result.recordset[0].qty,
            price:result.recordset[0].price,
            total:totals.recordset[0],
        }
        return obj
    } catch (err) {
        console.log(err);
    }
}


async function postDecreaseQuantityCart(cartID,PID) {
    try {
        let pool = await sql.connect(sqlConfig)
        const result = await pool.request()
            .input('cartID',sql.Int,cartID)
            .input('PID',sql.Int,PID)
            .query('UPDATE cartItems SET cartitems.qty-=1 output inserted.qty as qty,p.price as price FROM cartItems c INNER JOIN products p ON cartID= @cartID and productID= @pid  and  c.productID = p.id;')
        if(result.recordset[0].qty==0){
            await deleteItemFromCartItems(cartID,PID)
        }
            // total = await pool.request()
            //     .input('userID',sql.Int,userID)
            //     .input('price',sql.Money,price)
            //     .query('update carts set totalPrice -= @price,totalQuantity-=1 output inserted.totalPrice,inserted.totalQuantity where userid = @userID')
        //update total price and qty
        let totals = await getTotals(cartID)
        let obj={
            qty:result.recordset[0].qty,
            price:result.recordset[0].price,
            total:totals.recordset[0]
        }
        return obj
    } catch (err) {
        console.log(err);
    }
}


module.exports ={
    saveCart,saveForLater,postIncreaseQuantityCart,postDecreaseQuantityCart
}