var ruleModal;
var ruleOutcomes = {};
var ruleFacts = [];
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
    Handlebars.registerHelper('length', (context) => {
        return context.length;
    });

    const templateSrc = document.getElementById(templateID).innerHTML;
    const template = Handlebars.compile(templateSrc);
    return template(data);
}

const renderRuleConditions = async () => {
    const template = renderFromTemplate('ruleConditionsTemplate', {outcomes: ruleOutcomes});
    $('#ruleOutcomes').html(template);
    addRowClickHandlers();
}

const loadOutcomes = async () => {
    let ruleID = $('#ruleId').val();
    $('#mainSpinner').show();
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'GET',
        dataType: 'json',
        success: function(data){
            $('#mainSpinner').hide();
            ruleOutcomes = data.outcomes;
            ruleFacts = data.facts;
            renderRuleConditions();
        },
        error: function(err){
            $('#mainSpinner').hide();
            console.log(err);
        }
    });
}

const addRowClickHandlers = () => {
    $('.conditionsTable').each(function() {
        $(this).on('click', 'tr', function(event) {
            const $row = $(this);
            if (!$(this).hasClass('form-converted')) {
                convertRowToForm($row);
                $(this).addClass('form-converted');
            }
        }
        );
    });
    $('.conditionsTable').on('click', 'input', function(event) {
        event.stopPropagation(); // Stop the click event from propagating to the row
    });
}

const convertRowToForm = (row) => {
    const $row = $(row);
    const index = splitConditonRowIndex($row.data('index'));
    const condition = ruleOutcomes[index[1]]['conditions'][index[2]][index[3]];

    // // Replace text with input fields
    const factCell = $row.find('td').eq(0);
    factCell.html(`<select class='form-control fact-select'><option disabled>Select Fact</option><option value='${condition.fact}' selected>${condition.fact}</option></select>`);
    const conditionOperator = renderFromTemplate('conditionOperatorSelectTemplate', {operator: condition.operator});
    $row.find("td:nth-child(2)").html(conditionOperator);
    $row.find("td:nth-child(3)").html(`<input type='text' value='${condition.value}' class='form-control'/>`);
    const $editBtn = $row.find('.btnEditRow');
    $editBtn.text('Save').off('click').on('click', function(event) {
        // Prevent the row click event from firing when clicking the button
        event.stopPropagation();
        saveTask(index, $row.find("input:nth-child(1)").val(), $row.find("input:nth-child(2)").val(),$row.find("input:nth-child(3)").val());
    });
    factCell.find('.fact-select').one('click', function() {
        populateFactOptions($(this), condition);
    });
}

const splitConditonRowIndex = (index) => {
    const parts = index.split('/');
    const lastIndex = parts.length - 1;
    parts[lastIndex] = parseInt(parts[lastIndex], 10);
    return parts;
}

const populateFactOptions = (select,currentCondition) => {
    select.find('option:not(:first)').remove();
    ruleFacts.forEach(function(fact) {
        select.append(new Option(fact.source+"-"+fact.name, fact.id, false, (fact.source+"-"+fact.name == currentCondition.fact)));
    });
};
