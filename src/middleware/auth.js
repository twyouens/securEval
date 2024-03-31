const APIKey = require('../models/apiKey.model');
const logger = require('../services/logger.service');

async function checkAPIKey(req, res, next) {
    if(!req.headers.authorization){
        req.log.warn({err: "Unauthorized Request", detail: "No Authorization Header"}, "Unauthorized Request");
        return res.status(401).json({message: 'Unauthorized'});
    }
    const token = (req.headers.authorization || "").replace(/^Bearer\s/,"");
    const apiKey = await APIKey.findOne({key: token}, function(err, apiKey){
        if(err){
            req.log.error({err: err, detail: "Error finding API Key"}, "Internal Server Error");
            res.status(500).json({message: 'Internal Server Error'});
            return false;
        }
    });
    if(!apiKey){
        req.log.warn({err: "Unauthorized Request", detail: "API Key not found"}, "Unauthorized Request");
        return res.status(401).json({message: 'Unauthorized'});
    }
    if(apiKey.key !== token){
        req.log.warn({err: "Unauthorized Request", detail: "API Key does not match", data: {apiKey: apiKey}}, "Unauthorized Request");
        return res.status(401).json({message: 'Unauthorized'});
    }
    if(!apiKey.isActive){
        req.log.warn({err: "Unauthorized Request", detail: "API Key is not active", data: {apiKey: apiKey}}, "Unauthorized Request");
        return res.status(401).json({message: 'Unauthorized'});
    }
    req.token = apiKey;
    next();
}

module.exports = {checkAPIKey};