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