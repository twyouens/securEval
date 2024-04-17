class Parser {
    constructor(ruleObject) {
        this.ruleJson = ruleObject;
    }

    parse() {
        this.validateRuleJson();
        const rule = {
            name: this.ruleJson.name,
            version: this.ruleJson.version,
            description: this.ruleJson.description,
            targets: this.ruleJson.targets,
            facts: this.ruleJson.facts,
            outcomes: this.parseOutcomes(this.ruleJson.outcomes),
            outcomeRanking: this.ruleJson['outcomeRanking']
        };
        return rule;
    }

    validateRuleJson() {
        const requiredTopLevelFields = ['name', 'version', 'description', 'facts', 'targets', 'outcomes', 'outcomeRanking'];
        requiredTopLevelFields.forEach(field => {
          if (!this.ruleJson.hasOwnProperty(field)) {
            throw new Error(`Rule JSON is missing required field: ${field}`);
          }
        });
        Object.entries(this.ruleJson.outcomes).forEach(([outcome, detail]) => {
            if (!detail.conditions) {
              throw new Error(`Outcome "${outcome}" is missing required "conditions" field.`);
            }
            this.validateConditions(detail.conditions);
        });
        this.validateTargets(this.ruleJson.targets);
        this.validateFacts(this.ruleJson.facts);
    }
    validateConditions(conditions) {
        const validOperators = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'contains'];
        ['all', 'any'].forEach(conditionType => {
          if (conditions[conditionType]) {
            conditions[conditionType].forEach(condition => {
              if (!condition.fact || !condition.operator || condition.value === undefined) {
                throw new Error('Condition is missing required fields (fact, operator, value).');
              }
              if (!validOperators.includes(condition.operator)) {
                throw new Error(`Invalid operator "${condition.operator}". Must be one of ${validOperators.join(', ')}.`);
              }
            });
          }
        });
    }
    validateTargets(targets) {
        if (!Array.isArray(targets)) {
            throw new Error('Targets must be an array.');
        }
        if (targets.length > 0) {
            targets.forEach(target => {
                if (typeof target !== 'string') {
                    throw new Error('Each target in the targets array must be a string (appID).');
                }
            });
        }
    }
    validateFacts(facts) {
        if (!Array.isArray(facts)) {
            throw new Error('Facts must be an array.');
        }
        if (facts.length > 0) {
            facts.forEach(fact => {
                if (!fact.name || !fact.type || !fact.source == "static" || !fact.source == "request") {
                    throw new Error('Each fact must have a name, type, and source.');
                }
            });
        }
    }


    parseOutcomes(outcomesJson) {
        const outcomes = {};
        for (const [outcome, detail] of Object.entries(outcomesJson)) {
            outcomes[outcome] = {
                conditions: this.parseConditions(detail.conditions)
            };
        }
        return outcomes;
    }

    parseConditions(conditionsJson) {
        const conditions = {
            all: [],
            any: [],
        };
        if (conditionsJson.all) {
            conditions.all = conditionsJson.all.map(condition => this.parseCondition(condition));
        }
        if (conditionsJson.any) {
            conditions.any = conditionsJson.any.map(condition => this.parseCondition(condition));
        }
        return conditions;
    }

    parseCondition(conditionJson) {
        if(conditionJson.value === "true"){conditionJson.value = true;}
        if(conditionJson.value === "false"){conditionType.value = false;}
        if(conditionJson.value === "'true'"){conditionJson.value = "true";}
        if(conditionJson.value === "'false'"){conditionJson.value = "false";}
        return {
            fact: conditionJson.fact,
            operator: conditionJson.operator,
            value: conditionJson.value,
            _id: conditionJson._id
        };
    }


}

module.exports = Parser;