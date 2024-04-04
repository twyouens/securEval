const express = require("express");
const apiController = require("../controller/api.controller");
const apiAuthenticatedRouter = require("./api.authenticated.v1");

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
    res.json({ message: "Hello, World!" });

});

apiRouter.post("/test/new-tenant", apiController.TESTNewTenant);
apiRouter.post("/test/upload-rule", apiController.TESTUploadRule);
apiRouter.post("/test/new-token", apiController.TESTGenerateToken);

apiRouter.use("", apiAuthenticatedRouter);

module.exports = apiRouter;