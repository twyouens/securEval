const Rule = require('../models/rule.model');
const Parser = require('../engine/parser');

async function getRule(req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.token.tenant},null,{lean: true});
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const plainRule = JSON.parse(JSON.stringify(rule));
    console.log(plainRule);
    const parser = new Parser(plainRule);
    let parsedRule = parser.parse();
    res.json(parsedRule);
}

async function getRules(req, res, next) {
    const rules = await Rule.find({tenant: req.token.tenant},null,{lean: true}).select('name tenant description version created updated targets');
    res.json(rules);
}


module.exports = {
    getRule,
    getRules
};