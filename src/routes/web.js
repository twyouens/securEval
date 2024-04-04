const express = require("express");
const webController = require("../controller/web.controller");

const webRouter = express.Router();

webRouter.get("/login", webController.login);
webRouter.post("/login", webController.loginPassword);

module.exports = webRouter;