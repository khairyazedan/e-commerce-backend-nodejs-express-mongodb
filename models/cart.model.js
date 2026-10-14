const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity:{
        type:Number,
        required: true,
        min:[1, "Quantity cannot be less than 1"],
        default: 1
    },
    price:{
        type:Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    sessionId:{
        type:String,
        default: null
    }, 
    items:[cartItemSchema],
    subTotal:{
        type:Number,
        default:0
    },
    grandTotal:{
        type:Number,
        default:0
    },
    expiresAt:{
        type:Date,
        default: ()=> new Date(Date.now() + 30*24*60*60*1000)
    }
}, {timestamps: true});

// ttl index to automatically delete abandoned guest carts after 30 days
cartSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;
