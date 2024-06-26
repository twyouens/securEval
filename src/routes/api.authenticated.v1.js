const express = require("express");
const apiAuthenticatedController = require("../controller/api.authenticated.controller");
const { checkAPIKey } = require("../middleware/auth");

const apiAuthenticatedRouter = express.Router();
apiAuthenticatedRouter.use(checkAPIKey);


//rules
apiAuthenticatedRouter.get("/rules", apiAuthenticatedController.getRules);
apiAuthenticatedRouter.post("/rules", apiAuthenticatedController.createRule);
apiAuthenticatedRouter.get("/rule/:ruleID", apiAuthenticatedController.getRule);
apiAuthenticatedRouter.put("/rule/:ruleID", apiAuthenticatedController.updateRule);
apiAuthenticatedRouter.get("/rule/:ruleID/fact/:factID", apiAuthenticatedController.getRuleFact);
apiAuthenticatedRouter.post("/rule/:ruleID/evaluate", apiAuthenticatedController.evaluateRule);

//tenants
apiAuthenticatedRouter.get("/tenant/me", apiAuthenticatedController.getMyTenant);

//users
// apiAuthenticatedRouter.get("/user/me", apiAuthenticatedController.getMe);
apiAuthenticatedRouter.get("/users", apiAuthenticatedController.getTenantUsers);
apiAuthenticatedRouter.get("/user/:userID", apiAuthenticatedController.getTenantUser);

//apps
apiAuthenticatedRouter.get("/apps", apiAuthenticatedController.getApps);
apiAuthenticatedRouter.post("/apps", apiAuthenticatedController.createApp);
apiAuthenticatedRouter.get("/app/:appID", apiAuthenticatedController.getApp);


module.exports = apiAuthenticatedRouter;
