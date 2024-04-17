const Rule = require('../models/rule.model');

async function home (req, res) {
    res.render("dashboard",{session: req.session});
}

async function logout (req, res) {
    res.clearCookie('token');
    res.redirect('/login');
}

async function rules (req, res) {
    const tenantRules = await Rule.find({tenant: req.session.tenant._id}).select('name description version createdAt updatedAt targets');
    const moment = require('moment');
    res.render("rules",{session: req.session, rules: tenantRules, moment: moment});
}

async function manageRule (req, res) {
    const ruleID = req.params.ruleID;
    const rule = await Rule.findOne({_id: ruleID, tenant: req.session.tenant._id});
    if(!rule){
        return res.status(404).render('404');
    }
    res.render("rule",{session: req.session, rule: rule});
}

module.exports = {
    home,
    logout,
    rules,
    manageRule
};
