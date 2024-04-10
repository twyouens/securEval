var ruleModal;
const initializeRuleModal = () => {
    ruleModal = new bootstrap.Modal(document.getElementById("ruleModal"), {});
}
const updateRuleBasicForm = () => {
    let formData = {
        name: $('#name').val(),
        description: $('#description').val()
    }
    let ruleID = $('#ruleId').val();
    console.log(formData);
    let validationErrors = validateRuleBasicForm(formData);
    if(validationErrors.length > 0){
        validationErrors.forEach((error) => {
            $(`#${error.input}`).addClass('is-invalid');
            $(`#${error.input}Feedback`).text(error.message);
        });
        return null;
    }
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'PUT',
        dataType: 'json',
        data: formData,
        success: function(data){
            window.location.reload();
        },
        error: function(err){
            console.log(err);
        }
    });

}

const validateRuleBasicForm = (data) => {
    let errors = [];
    if(!/^[a-zA-Z0-9 \-_.]{1,60}$/.test(data.name)){
        errors.push({input: "name", message: "Invalid name"});
    }
    if(!/^[a-zA-Z0-9 \-_.]{1,150}$/.test(data.description)){
        errors.push({input: "description", message: "Invalid description"});
    }
    return errors;
}

const modalRuleFact = (factID) => {
    let ruleID = $('#ruleId').val();
    $.ajax({
        url: '/api/v1/rule/'+ruleID+'/fact/'+factID,
        method: 'GET',
        dataType: 'json',
        success: function(data){
            let modalBody = renderFromTemplate('ruleFactModalTemplate', {fact: data});
            $('#ruleModalBody').html(modalBody);
            $('#ruleModalTitle').text("Fact");
            initializeRuleModal();
            ruleModal.show();
        },
        error: function(err){
            console.log(err);
        }
    });
            
}

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

    const templateSrc = document.getElementById(templateID).innerHTML;
    const template = Handlebars.compile(templateSrc);
    return template(data);
}

const renderRuleConditions = () => {
    let outcomes = JSON.parse($('#ruleOutcomesData').val());
    console.log(outcomes);
    const template = renderFromTemplate('ruleConditionsTemplate', {outcomes: outcomes});
    $('#ruleOutcomes').html(template);
}
