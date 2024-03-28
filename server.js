const express = require("express");
const app = express();
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const config = dotenv.config();
dotenvExpand.expand(config);

const apiRouter = require("./src/routes/api.v1");
const connect = require('./src/services/db.service');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRouter);
connect();
app.listen(process.env.APP_PORT, ()=>{console.log(`Server started! vist: ${process.env.APP_URL}`)})