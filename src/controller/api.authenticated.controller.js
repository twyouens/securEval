const Rule = require('../models/rule.model');
const Coordinator = require('../engine/coordinator');
const Parser = require('../engine/parser');
const {checkEvalRequestFacts} = require('../helpers/request.helper');

async function getRule(req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.token.tenant},null,{lean: true});
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const parser = new Parser(rule);
    let parsedRule = parser.parse();
    res.json(parsedRule);
}

async function getRules(req, res, next) {
    const rules = await Rule.find({tenant: req.token.tenant},null,{lean: true}).select('name tenant description version created updated targets');
    res.json(rules);
}

async function evaluateRule(req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.token.tenant},null,{lean: true});
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const coordinator = new Coordinator();
    coordinator.parseRule(rule);
    const requestFacts = checkEvalRequestFacts(req.body);
    const result = coordinator.run(requestFacts);
    res.json({
        state: "success",
        result: result
    });
}

module.exports = {
    getRule,
    getRules,
    evaluateRule
};