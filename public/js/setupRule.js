var rule = {};
const renderFromTemplate = (templateID, data) => {
    Handlebars.registerHelper('optionSelected', function(arg1, arg2) {
        return arg1 == arg2 ? 'selected' : '';
    });
    Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options) {
        var operators, result;
      
        if (arguments.length < 3) {
          throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }
      
        if (options === undefined) {
          options = rvalue;
          rvalue = operator;
          operator = "===";
        }
      
        operators = {
          '==': function(l, r) { return l == r; },
          '===': function(l, r) { return l === r; },
          '!=': function(l, r) { return l != r; },
          '!==': function(l, r) { return l !== r; },
          '<': function(l, r) { return l < r; },
          '>': function(l, r) { return l > r; },
          '<=': function(l, r) { return l <= r; },
          '>=': function(l, r) { return l >= r; },
          'typeof': function(l, r) { return typeof l == r; }
        };
      
        if (!operators[operator]) {
          throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
      
        result = operators[operator](lvalue, rvalue);
      
        if (result) {
          return true;
        } else {
          return false;
        }
      });
    Handlebars.registerHelper('eachKeyValue', (context, options) => {
        let ret = "";
        for (let key in context) {
            if (context.hasOwnProperty(key)) {
            ret = ret + options.fn({key: key, value: context[key]});
            }
        }
        return ret;
    });
    Handlebars.registerHelper('length', (context) => {
        return context.length;
    });

    const templateSrc = document.getElementById(templateID).innerHTML;
    const template = Handlebars.compile(templateSrc);
    return template(data);
}

const renderRuleDeploy = (appID) => {
    let app = rule.targets.filter(target => target._id === appID)[0];
    if(!app){
        console.log('App not found');
        return;
    }
    let requestFacts = rule.facts.filter(fact => fact.source === 'request');
    let requestExampleBody = requestFacts.reduce((acc, fact) => {acc.facts[fact.name] = fact.type;return acc;}, { facts: {},app: app._id });
    let requestExampleBodyString = JSON.stringify(requestExampleBody, undefined, 2);
    let responseExampleString = JSON.stringify({state: "success", result: "allowed"}, undefined, 2);
    let template = renderFromTemplate('setupRuleDeployTemplate', {rule: rule, app: app, requestFacts: requestFacts, requestExampleBody: requestExampleBodyString, responseExample: responseExampleString});
    $('#deployBlock').html(template);
};

const initializeSetupRulePage = () => {
    let ruleID = $('#ruleId').val();
    $('#mainSpinner').show();
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'GET',
        dataType: 'json',
        success: function(data){
            $('#mainSpinner').hide();
            rule = data;
            rule._id = ruleID;
            renderSetupChecklist();
            addDeployHandlers();
        },
        error: function(err){
            $('#mainSpinner').hide();
            console.log(err);
        }
    });
};

const addDeployHandlers = () => {
    $('#deployAppList').one('click', function() {
        populateDeployApps();
    });
    $('#deployAppList').change(function() {
        renderRuleDeploy($(this).val());
    });
};

const populateDeployApps = (currentApp) => {
    if(rule.targets.length === 0){
        return;
    }
    let select = $('#deployAppList');
    select.find('option:not(:first)').remove();
    rule.targets.forEach(app => {
        select.append(new Option(app.name, app._id,false,app._id === currentApp));
    });
};

const renderSetupChecklist = () => {
    if(!rule){
        return;
    }
    let ruleReady = true;
    if(rule.facts.length > 0){
        $('#checklistRuleFacts').find('.status-circle').addClass('status-good');
    }else{
        ruleReady = false;
        $('#checklistRuleFacts').find('.status-circle').addClass('status-bad');
    }
    if(Object.keys(rule.outcomes).length > 0){
        $('#checklistRuleConditions').find('.status-circle').addClass('status-good');
    }else{
        ruleReady = false;
        $('#checklistRuleConditions').find('.status-circle').addClass('status-bad');
    }
    if(rule.targets.length > 0){
        $('#checklistRuleApps').find('.status-circle').addClass('status-good');
    }else{
        ruleReady = false;
        $('#checklistRuleApps').find('.status-circle').addClass('status-bad');
    }
    if(ruleReady){
        $('#checklistRuleReady').find('.status-circle').addClass('status-good');
        $('#deploySelect').show();
    }else{
        $('#checklistRuleReady').find('.status-circle').addClass('status-bad');
        $('#deployError').show();
    }
};