const cors = require('cors');
const AllowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");

const corsOptions = {
    origin: function(origin, cb){
        if(!origin) return cb(null, true)
        if (AllowedOrigins.includes(origin)) return cb(null, true)
        return cb(new Error('cors Policy: Origin not allowed'))
    },
    credentials: true,
    methods:['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', "Authorization"]
}

module.exports=cors(corsOptions);
