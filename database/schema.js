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
		type:Boolean,
		default:false
	},
	isSeller:{
		type:Boolean,
		default:false
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
            },
        }],
        totalPrice: {
		type: Number,
		default:0
		}
	},
	saveForLater:[
		{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'ProductDB',
                required: true
            }
        }
	]
	// [{
	// 	productId: {
	// 		type: Schema.Types.ObjectId,
	// 		ref: 'ProductDB',
	// 	}
	// }]
	// {	
	// 	type:Map,
	// 	of: Schema.Types.ObjectId,
	// 	ref:'ProductDB'
	// }
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
    },
	isAvailable:{
		type:Boolean,
		default:function() {
			if (this.qty>0) {
				return true;
			}
			return false;
		}
	},
	seller:{
		type: Schema.Types.ObjectId,
        ref: 'UserDB',
	}
})


const UserDB = mongoose.model("UserDB",userSchema)
const ProductDB = mongoose.model("ProductDB",productSchema)
module.exports ={
    UserDB,ProductDB
}