class Evaluator {
    constructor(rules) {
        this.rules = rules;
    }

    evaluate(facts) {
        for(const rule of this.rules) {
            const result = this.evaluateRule(rule, facts);
            if (result !== null) {
                return result;
            }
        }
        return "denied";
    }
    evaluateRule(rule, facts) {
        // Iterate through the outcomes based on the rule's outcome ranking
        for(const outcomeName of rule.outcomeRanking) {
            let outcomeConditions = rule["outcomes"][outcomeName]["conditions"]
            if (this.evaluateOutcome(outcomeConditions, facts)) {
                return outcomeName // Return the name of the first matching outcome
            }
        }
        return null // No outcome matched in this rule
    }
    evaluateOutcome(conditions, facts) {
        // Evaluate the conditions for an outcome
        for(const conditionType of ["all", "any"]) {
            if (conditions[conditionType]) {
                if (this.evaluateConditions(conditions[conditionType], facts, conditionType)) {
                    return true;
                }
            }
        }
        return false;
    }
    evaluateConditions(conditions, facts, conditionType) {
        let conditionMatches = conditionType === "all"; // Assume "all" matches to start, adjust based on actual conditions

        for (const condition of conditions) {
            const conditionMatch = this.evaluateCondition(condition, facts);

            if (conditionType === "all" && !conditionMatch) {
                // For "all", if any condition doesn't match, return false immediately
                return false;
            } else if (conditionType === "any" && conditionMatch) {
                // For "any", if any condition matches, return true immediately
                return true;
            }
        }
        return conditionMatches;
    }
    evaluateCondition(condition, facts) {
        // Evaluate a single condition
        const dynamicFactPattern = /^\[((request-|static-)([a-zA-Z][a-zA-Z0-9_-]*))\]$/;
        const factValue = this.getFactValue(condition.fact, facts);
        const isDynamicFact = dynamicFactPattern.test(condition.value);
        let comparisonValue = condition.value;
        if(isDynamicFact) {
            const matches = condition.value.match(dynamicFactPattern);
            const dynamicFactKey = matches[1];
            comparisonValue = this.getFactValue(dynamicFactKey, facts);
        }
        console.log("Evaluating condition: "+JSON.stringify(condition)+" with fact value: "+factValue+" and comparison value: "+comparisonValue+" (isDynamicFact: "+isDynamicFact+")");
        switch(condition.operator) {
            case "equal":
                return factValue === comparisonValue;
            case "notEqual":
                return factValue !== comparisonValue;
            case "greaterThan":
                return factValue > comparisonValue;
            case "lessThan":
                return factValue < comparisonValue;
            case "contains":
                return factValue.includes(comparisonValue);
            default:
                return false;
        }
    }
    
    getFactValue(factKey, facts) {
        // Get the value of a fact
        if(factKey in facts) {
            return facts[factKey];
        } else {
            return null;
        }
    }

}
module.exports = Evaluator;