const mongoose = require('mongoose');
const dbString = process.env.DB_CONNECTION_STRING;



async function connectToDatabase() {
    try {
        const connect = await mongoose.connect(dbString);
        console.log(`Database is connected Successfully! on : ${connect.connection.host}`);
    } catch (error) {
        console.log(`error while connecting to database ${error}`);
        process.exit(1);
    }
    
}

module.exports = {connectToDatabase};