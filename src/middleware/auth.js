const APIKey = require('../models/apiKey.model');

async function checkAPIKey(req, res, next) {

    if(!req.headers.authorization){
        return res.status(401).json({message: 'Unauthorized'});
    }
    const token = (req.headers.authorization || "").replace(/^Bearer\s/,"");
    const apiKey = await APIKey.findOne({key: token}, function(err, apiKey){
        if(err){
            res.status(500).json({message: 'Internal Server Error'});
            return false;
        }
    });
    if(!apiKey){
        return res.status(401).json({message: 'Unauthorized'});
    }
    if(apiKey.key !== token){
        return res.status(401).json({message: 'Unauthorized'});
    }
    if(!apiKey.isActive){
        return res.status(401).json({message: 'Unauthorized'});
    }
    req.token = apiKey;
    next();
}

module.exports = {checkAPIKey};