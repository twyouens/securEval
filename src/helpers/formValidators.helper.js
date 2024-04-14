function validateRuleForm(requestBody){
    //validate the request body
    let errors = [];
    const allowedKeys = ["name", "description", "version", "targets", "facts", "outcomes", "outcomeRanking"];
    const objKeys = Object.keys(requestBody);
    const invalidKeys = objKeys.filter(key => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        errors.push({input: invalidKeys[0], message: "Invalid key"});
    }
    if(requestBody.name){
        if(!(/^[a-zA-Z0-9 \-_.]{1,60}$/.test(requestBody.name))){
            errors.push({input: "name", message: "Invalid name"});
        }
    }
    if(requestBody.description){
        if(!/^[a-zA-Z0-9 \-_.]{1,150}$/.test(requestBody.description)){
            errors.push({input: "description", message: "Invalid description"});
        }
    }
    if(requestBody.version){
        if(!/^[0-9.]{1,10}$/.test(requestBody.version)){
            errors.push({input: "version", message: "Invalid version"});
        }
    }
    if(requestBody.targets){
        if(!Array.isArray(requestBody.targets)){
            errors.push({input: "targets", message: "Invalid targets"});
        }
    }
    if(requestBody.facts){
        if(!Array.isArray(requestBody.facts)){
            errors.push({input: "facts", message: "Invalid facts"});
        }
    }
    if(requestBody.outcomes){
        if(typeof requestBody.outcomes !== 'object'){
            errors.push({input: "outcomes", message: "Invalid outcomes"});
        }
        const allowedOutcomes = ["allowed", "additional-information", "denied"];
        const outcomeKeys = Object.keys(requestBody.outcomes);
        const invalidOutcomes = outcomeKeys.filter(key => !allowedOutcomes.includes(key));
        if (invalidOutcomes.length > 0) {
            errors.push({input: invalidOutcomes[0], message: "Invalid outcome key"});
        }
        Object.entries(requestBody.outcomes).forEach(([outcome, detail]) => {
            if (!detail.conditions) {
                errors.push({input: "conditions", message: "Outcome is missing required conditions field."});
            }
            if(typeof detail.conditions !== 'object'){
                errors.push({input: "conditions", message: "Invalid conditions"});
            }
            const conditionTypes = ["all", "any"];
            const conditionKeys = Object.keys(detail.conditions);
            const invalidConditions = conditionKeys.filter(key => !conditionTypes.includes(key));
            if (invalidConditions.length > 0) {
                errors.push({input: invalidConditions[0], message: "Invalid condition key"});
            }
            Object.entries(detail.conditions).forEach(([conditionType, conditions]) => {
                if(!Array.isArray(conditions)){
                    errors.push({input: "conditions", message: "Invalid conditions"});
                }
                conditions.forEach(condition => {
                    if (!condition.fact || !condition.operator || condition.value === undefined) {
                        errors.push({input: "conditions", message: "Condition is missing required fields (fact, operator, value)", conditionType: conditionType, conditionInput: condition});
                    }
                    if(!(/^(request|static)-([a-zA-Z][a-zA-Z0-9_-]*)$/.test(condition.fact))){
                        errors.push({input: "conditions", message: "Invalid fact", conditionType: conditionType, conditionInput: condition.fact});
                    }
                    if(!(/^(\[((request|static)-[a-zA-Z0-9_-]+)\]|[a-zA-Z0-9_-]+)$/.test(condition.value))){
                        errors.push({input: "conditions", message: "Invalid value", conditionType: conditionType, conditionInput: condition.value});
                    }
                    const validOperators = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'contains'];
                    if (!validOperators.includes(condition.operator)) {
                        errors.push({input: "conditions", message: `Invalid operator "${condition.operator}". Must be one of ${validOperators.join(', ')}`});
                    }
                });
            });
        });
    }
    if(requestBody.outcomeRanking){
        if(!Array.isArray(requestBody.outcomeRanking)){
            errors.push({input: "outcomeRanking", message: "Invalid outcomeRanking"});
        }
    }
    return errors.length >0 ? errors : true;
}

module.exports = {
    validateRuleForm
};