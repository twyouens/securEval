const Rule = require('../models/rule.model');
const Coordinator = require('../engine/coordinator');
const Parser = require('../engine/parser');
const User = require('../models/user.model');
const Tenant = require('../models/tenant.model');
const App = require('../models/app.model');
const {checkEvalRequestFacts} = require('../helpers/request.helper');
const {validateRuleForm} = require('../helpers/formValidators.helper');

async function getRule(req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.session.tenant._id},null,{lean: true}).populate('targets');
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const parser = new Parser(rule);
    let parsedRule = parser.parse();
    res.json(parsedRule);
}

async function getRules(req, res, next) {
    const rules = await Rule.find({tenant: req.session.tenant._id},null,{lean: true}).select('name tenant description version created updated targets');
    res.json(rules);
}

async function evaluateRule(req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.session.tenant._id},null,{lean: true}).populate('targets');
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

async function createRule(req, res, next) {
    const newRule = {
        name: req.body.name,
        description: req.body.description,
        version: "1.0",
        tenant: req.session.tenant._id,
        targets: [],
        outcomes: {
            allowed: {
                conditions: {
                    all: [],
                    any: []
                }
            },
            "additional-information": {
                conditions: {
                    all: [],
                    any: []
                }
            },
            denied: {
                conditions: {
                    all: [],
                    any: []
                }
            }
        },
        outcomeRanking: [
            "allowed",
            "additional-information",
            "denied"
        ]
    };
    const rule = new Rule(newRule);
    try {
        await rule.save();
        res.json(rule);
    } catch (err) {
        req.log.error({err: err, detail: "Error saving rule", data: {newRule: newRule}}, "Internal Server Error");
        next(err);
    }
}

async function getMyTenant (req, res, next) {
    const tenant = await Tenant.findOne({_id: req.session.tenant._id});
    if(!tenant){
        return res.status(404).json({message: 'Tenant not found'});
    }
    res.json(tenant);
}

async function getTenantUsers (req, res, next) {
    const users = await User.find({tenant: req.session.tenant._id}).select('username email name role isActive createdAt updatedAt');
    res.json(users);
}

async function getTenantUser (req, res, next) {
    const userID = req.params.userID;
    const user = await User.findOne({_id: userID, tenant: req.session.tenant._id}).select('username email name role isActive createdAt updatedAt');
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
}

async function updateRule (req, res, next) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.session.tenant._id});
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const formErrors = validateRuleForm(req.body);
    req.body.updatedAt = new Date();
    if(formErrors !== true){
        req.log.warn({err: "Invalid form data", detail: "Invalid form data", data: {formErrors: formErrors}}, "Invalid form data");
        return res.status(400).json({message: 'Invalid form data', errors: formErrors});
    }
    try{
        const updatedRule = await Rule.findByIdAndUpdate(ruleID, req.body);
        return res.json({state: "success"});
    } catch (err) {
        req.log.error({err: err, detail: "Error updating rule", data: {ruleID: ruleID, updateData: req.body}}, "Internal Server Error");
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

async function getRuleFact (req, res, next) {
    const ruleID = req.params.ruleID;
    const factID = req.params.factID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.session.tenant._id});
    if(!rule){
        return res.status(404).json({message: 'Rule not found'});
    }
    const fact = rule.facts.id(factID);
    if(!fact){
        return res.status(404).json({message: 'Fact not found'});
    }
    res.json(fact);
}

const getApps = async (req, res, next) => {
    const apps = await App.find({tenant: req.session.tenant._id});
    res.json(apps);
};

const getApp = async (req, res, next) => {
    const appID = req.params.appID;
    const app = await App.findOne({_id: appID, tenant: req.session.tenant._id});
    if(!app){
        return res.status(404).json({message: 'App not found'});
    }
    res.json(app);
}

const createApp = async (req, res, next) => {
    const newApp = {
        name: req.body.name,
        description: req.body.description,
        tenant: req.session.tenant._id,
        website: req.body.website,
    };
    const app = new App(newApp);
    try {
        await app.save();
        res.json(app);
    } catch (err) {
        req.log.error({err: err, detail: "Error saving app", data: {newApp: newApp}}, "Internal Server Error");
        next(err);
    }
}
    



module.exports = {
    getRule,
    getRules,
    evaluateRule,
    getMyTenant,
    createRule,
    getTenantUsers,
    getTenantUser,
    updateRule,
    getRuleFact,
    getApps,
    getApp,
    createApp
};