const express = require("express");
const webController = require("../controller/web.controller");
const webAuthenticatedRouter = require("./web.authenticated");

const webRouter = express.Router();

webRouter.get("/login", webController.login);
webRouter.post("/login", webController.loginPassword);

webRouter.use("",webAuthenticatedRouter)

module.exports = webRouter;