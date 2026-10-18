require('dotenv').config();
const port = process.env.PORT;
const express = require('express');
const dbConfig = require('./config/db.config.js');
const imagekitRoutes = require('./routes/imageKit.route.js');
const authRoutes = require('./routes/auth.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const app = express();
const corsMiddleware = require('./middlewares/cors.middleware.js');
const accoutRoutes = require('./routes/account.routes.js');
const productRoutes = require('./routes/product.routes.js');
const categoryRoutes = require('./routes/category.route.js');
const AppError = require('./utils/appError.utils.js');
const sanitize = require('express-mongo-sanitize')
const xss = require('xss-sanitize')

// middlewares
const cookieParser = require("cookie-parser");
app.use(corsMiddleware);
app.use(express.json());
// app.use(sanitize())
app.use(xss())
app.use(cookieParser())
app.use("/imagekit", imagekitRoutes);


//auth Routes
app.use('/api/auth', authRoutes)
app.use("/api/auth/refresh", require("./routes/refreshToken.route.js"));

// admin Routes
app.use('/api/admin', adminRoutes)
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/categories", categoryRoutes);

// user Routes
app.use('/api/account', accoutRoutes);

// default Route
app.use((req, res, next)=>{
    const err = new AppError(`cannot find this route "${req.originalUrl}"`, 404)
    next(err);
    
})

dbConfig.connectToDatabase()

app.use(require('./middlewares/errorHandler.middleware.js'));


app.listen(port,_=>console.log(`Server is up and running on port ${port}`));
