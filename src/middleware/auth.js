const APIKey = require('../models/apiKey.model');
const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const JWT = require('jsonwebtoken');

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

async function checkUserToken(req, res, next) {
    if(!req.cookies.token){
        return res.redirect('/login');
    }
    const token = req.cookies.token;
    try{
        var decoded = JWT.verify(token, process.env.JWT_SECRET);
        req.token = decoded;
    }catch(err){
        req.log.warn({err: "Unauthorized Request", detail: "Invalid Token"}, "Unauthorized Request");
        return res.redirect('/login');
    }
    next();
}

async function addUserSessionData(req, res, next) {
    if(req.token){
        req.session = {};
        const user = await User.findById(req.token.data._id).select('username name role isActive createdAt updatedAt');
        if(user){
            req.session['user'] = user;
        }
        const tenant = await Tenant.findById(req.token.data.tenant);
        if(tenant){
            req.session['tenant'] = tenant;
        }
    }
    next();
}


module.exports = {checkAPIKey, checkUserToken, addUserSessionData};