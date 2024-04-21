const express = require("express");
const webAuthenticatedController = require("../controller/web.authenticated.controller");
const {checkUserToken, addUserSessionData} = require("../middleware/auth");
// const {moment} = require("../middleware/times");

const webAuthenticatedRouter = express.Router();
webAuthenticatedRouter.use(checkUserToken);
webAuthenticatedRouter.use(addUserSessionData);
// webAuthenticatedRouter.use(moment);

webAuthenticatedRouter.get("/", webAuthenticatedController.home);
webAuthenticatedRouter.get("/signout", webAuthenticatedController.logout);
webAuthenticatedRouter.get("/rules", webAuthenticatedController.rules);
webAuthenticatedRouter.get("/rule/:ruleID", webAuthenticatedController.manageRule);
webAuthenticatedRouter.get("/setup", webAuthenticatedController.setup);
webAuthenticatedRouter.get("/setup/rule/:ruleID", webAuthenticatedController.setupRule);


module.exports = webAuthenticatedRouter;