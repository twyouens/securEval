const express = require("express");
const apiAuthenticatedRouter = require("./api.authenticated.v1");

const apiRouter = express.Router();

apiRouter.use(apiAuthenticatedRouter);

module.exports = apiRouter;