require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json())
const cors = require("cors");
app.use(cors());

// Setup your Middleware and API Router here

const apiRouter = require('./api');
app.use('/api', apiRouter);

const client = require("./db/client")
client.connect();

module.exports = app;