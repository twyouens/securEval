function validateRuleForm(requestBody){
    //validate the request body
    const allowedKeys = ["name", "description", "version", "targets", "facts", "outcomes", "outcomeRanking"];
    const objKeys = Object.keys(requestBody);
    const invalidKeys = objKeys.filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        return {input: invalidKeys[0], message: "Invalid key"};
    }
    if(requestBody.name){
        if(!(/^[a-zA-Z0-9 \-_.]{1,60}$/.test(requestBody.name))){
            return {input: "name", message: "Invalid name"};
        }
    }
    if(requestBody.description){
        if(!/^[a-zA-Z0-9 \-_.]{1,150}$/.test(requestBody.description)){
            return {input: "description", message: "Invalid description"};
        }
    }
    if(requestBody.version){
        if(!/^[0-9.]{1,10}$/.test(requestBody.version)){
            return {input: "version", message: "Invalid version"};
        }
    }
    if(requestBody.targets){
        if(!Array.isArray(requestBody.targets)){
            return {input: "targets", message: "Invalid targets"};
        }
    }
    if(requestBody.facts){
        if(!Array.isArray(requestBody.facts)){
            return {input: "facts", message: "Invalid facts"};
        }
    }
    if(requestBody.outcomes){
        if(typeof requestBody.outcomes !== 'object'){
            return {input: "outcomes", message: "Invalid outcomes"};
        }
        const allowedOutcomes = ["allowed", "additional-information", "denied"];
        const outcomeKeys = Object.keys(requestBody.outcomes);
        const invalidOutcomes = outcomeKeys.filter(key => !allowedOutcomes.includes(key));
        if (invalidOutcomes.length > 0) {
            return {input: invalidOutcomes[0], message: "Invalid outcome key"};
        }
        Object.entries(requestBody.outcomes).forEach(([outcome, detail]) => {
            if (!detail.conditions) {
                return {input: "conditions", message: "Outcome is missing required conditions field."};
            }
            if(typeof detail.conditions !== 'object'){
                return {input: "conditions", message: "Invalid conditions"};
            }
            const conditionTypes = ["all", "any"];
            const conditionKeys = Object.keys(detail.conditions);
            const invalidConditions = conditionKeys.filter(key => !conditionTypes.includes(key));
            if (invalidConditions.length > 0) {
                return {input: invalidConditions[0], message: "Invalid condition key"};
            }
            ['all', 'any'].forEach(conditionType => {
                if (detail.conditions[conditionType]) {
                    if(!Array.isArray(detail.conditions[conditionType])){
                        return {input: "conditions", message: "Invalid conditions"};
                    }
                    detail.conditions[conditionType].forEach(condition => {
                        if (!condition.fact || !condition.operator || condition.value === undefined) {
                            return {input: "conditions", message: "Condition is missing required fields (fact, operator, value)"};
                        }
                        const validOperators = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'contains'];
                        if (!validOperators.includes(condition.operator)) {
                            return {input: "conditions", message: `Invalid operator "${condition.operator}". Must be one of ${validOperators.join(', ')}`};
                        }
                    });
                }
            });

        });
    }
    if(requestBody.outcomeRanking){
        if(!Array.isArray(requestBody.outcomeRanking)){
            return {input: "outcomeRanking", message: "Invalid outcomeRanking"};
        }
    }
    return true;
}

module.exports = {
    validateRuleForm
};