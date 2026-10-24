const NodeCache = require( "node-cache" );
const MIN = process.env.MIN;
const myCache = new NodeCache({stdTTL:MIN*5, checkperiod: MIN});


 

module.exports = myCache; 