const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
	email:{
		type:String,
		required:[true,"please enter email"]
	},
	password:{
		type:String,
		required:[true,"please enter password"]
	},
	firstName:{
		type:String,
	},
	lastName:{
		type:String,
	},
	mobileNumber:{
		type:Number
	},
	isVerified:{
		type: Boolean
	},
	token:{
		type: Number
	},
	isAdmin:{
		type:Boolean
	},
	cart:{
		items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'ProductDB',
                required: true
            },
            qty: {
                type: Number,
                required: true
            }
        }],
        totalPrice: Number
	}
})

//products Schema

const productSchema = new Schema({
	qty:{
		type:Number
	},
    name:{
        type:String
    },
    image:{
        type:String
    },
    price:{
        type:Number
    },
    details:{
        type:String
    }
})


const UserDB = mongoose.model("UserDB",userSchema)
const ProductDB = mongoose.model("ProductDB",productSchema)
module.exports ={
    UserDB,ProductDB
}