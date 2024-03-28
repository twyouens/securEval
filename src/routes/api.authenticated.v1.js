const express = require("express");
const apiAuthenticatedController = require("../controller/api.authenticated.controller");
const { checkAPIKey } = require("../middleware/auth");

const apiAuthenticatedRouter = express.Router();
apiAuthenticatedRouter.use(checkAPIKey);

apiAuthenticatedRouter.get("/rule/:ruleID", apiAuthenticatedController.getRule);

module.exports = apiAuthenticatedRouter;
