const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    street:{
        type:String,
        required: true
    },
    city:{
        type:String,
        required: true
    }, 
    state:{
        type:String,
        required: true
    },
    postalCode:{
        type:String,
        required: true
    },
    country:{
        type:String,
        required: true
    },
    phoneNum:{
        type:String,
        required: true
    }
}, {_id: false});

// const Address = mongoose.model('address', addressSchema);
module.exports = addressSchema;