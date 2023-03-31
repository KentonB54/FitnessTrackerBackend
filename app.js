require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json())


const client = require("./db/client")

client.connect();

const apiRouter = require('./api');
app.use('/api', apiRouter);

// Setup your Middleware and API Router here


module.exports = app;


