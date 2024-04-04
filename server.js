const express = require("express");
const app = express();
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const config = dotenv.config();
dotenvExpand.expand(config);
var path = require('path');

const logger = require('./src/services/logger.service');
app.use(logger);
const apiRouter = require("./src/routes/api.v1");
const connect = require('./src/services/db.service');
const webRouter = require("./src/routes/web");
const bp = require('body-parser');

app.set('views', path.join(__dirname, process.env.TEMPLATE_DIR)); 
app.set('view engine', 'ejs');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.use("/api/v1", apiRouter);
app.use("/", webRouter);
app.use("/static",express.static(path.join(__dirname, process.env.PUBLIC_DIR)));
connect();
app.listen(process.env.APP_PORT, ()=>{console.log(`Server started! vist: ${process.env.APP_URL}`)})