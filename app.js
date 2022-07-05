const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')
const helment = require('helmet')
const app = express();
const Blogs = require("./Route/BlogRoutes")
const users = require("./Route/UserRoutes")
const errormiddleware = require("./middleware/Error")
dotenv.config({path: './config.env'});

const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, Please try again in an hours!'
})



const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
console.log(DB) 
mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true, 
}).then((con)=>{
    console.log("sucessful database") 
});
app.use(helment())
app.use('/api', limiter)

app.use(express.json( {limit: '10kb'} )); 
 
app.use('/api/v1/products', Blogs)
app.use('/api/v1/users', users)

// middleware for error
app.use(errormiddleware)



module.exports = app
