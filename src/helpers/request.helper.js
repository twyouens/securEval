function checkEvalRequestFacts(requestBody){
    if(requestBody.facts){
        return requestBody.facts;
    }
    return {};
}

module.exports = {
    checkEvalRequestFacts
};