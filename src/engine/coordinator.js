const fs = require('fs');
const Parser = require('./parser');
const Facter = require('./facter');
const Evaluator = require('./evaluator');

class Coordinator {
  constructor(rulePath) {
    this._rulePath = rulePath;
    this.rules = [];
    this.facts = {};
  }

  loadRule(){
    const ruleJson = JSON.parse(fs.readFileSync(this._rulePath));
    this.parseRules(ruleJson);
  }
  parseRules(ruleJson) {
    const parser = new Parser(ruleJson);
    this.rules.push(parser.parse());
  }
  getRules() {
    return this.rules;
  }
  showRules() {
    console.log(this.rules);
  }
  
  loadFacts(policyFacts, requestFacts) {
    const facter = new Facter(policyFacts);
    facter.updateRequestFacts(requestFacts);
    return facter.getFacts();
  }
  run(requestFacts){
    let result = null;
    this.rules.forEach(rule => {
      const ruleFacts = this.loadFacts(rule.facts, requestFacts);
      result = this.evaluateRule(rule, ruleFacts);
    });
    return result;
  }
  evaluateRule(rule, facts) {
    const evaluator = new Evaluator([rule]);
    return evaluator.evaluate(facts);
  }

}
module.exports = Coordinator;