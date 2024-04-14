var ruleModal;
var ruleToast;
var ruleOutcomes = {};
var ruleFacts = [];
const initializeRuleModal = () => {
    ruleModal = new bootstrap.Modal(document.getElementById("ruleModal"), {});
}
const initializeRuleToast = () => {
    ruleToast = new bootstrap.Toast(document.getElementById("ruleToast"), {});
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
        $(this).on('click', 'tr.condition-row', function(event) {
            const $row = $(this);
            if (!$(this).hasClass('form-converted')) {
                convertRowToForm($row);
                $(this).addClass('form-converted');
            }
        }
        );
        $(this).on('click', '.add-condition', function(event) {
            const $row = $(this).closest('tr');
            addConditionRow($row);
        });
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
    const valueCell = $row.find('td').eq(2);
    let valueSelectHtml = `<select class='form-control value-select'><option disabled>Select Value</option><option value='other'>Other</option></select><input type='text' class='form-control value-text' style='display:none;' value='${condition.value}' />`;
    valueCell.html(valueSelectHtml);
    let valueSelect = valueCell.find('.value-select');
    populateValueOptions(valueSelect, condition);
    const $editBtn = $row.find('.btnEditRow');
    $editBtn.text('Save').off('click').on('click', function(event) {
        event.stopPropagation();
        saveConditionRow($row);
    });
    factCell.find('.fact-select').one('click', function() {
        populateFactOptions($(this), condition);
    });
    valueCell.find('.value-select').one('click', function() {
        populateValueOptions($(this), condition);
    });
    valueCell.find('.value-select').change(function() {
        if ($(this).val() === 'other') {
          $(this).siblings('.value-text').show();
        } else {
          $(this).siblings('.value-text').hide();
        }
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

const populateValueOptions = (select,currentCondition) => {
    let valueExistsInFacts = false;
    select.find('option:gt(1)').remove();
    ruleFacts.forEach(function(fact) {
        let optionFact = "["+fact.source+"-"+fact.name+"]";
        select.append(new Option(optionFact, optionFact,false, (optionFact == currentCondition.value)));
        if (optionFact == currentCondition.value) {
            valueExistsInFacts = true;
        }
    });
    if (!valueExistsInFacts && currentCondition.value || currentCondition.value == false) {
        select.val('other');
        select.siblings('.value-text').val(currentCondition.value).show();
    }else{
        select.val(currentCondition.value);
        select.siblings('.value-text').hide();
    }
};

const saveConditionRow = (row) => {
    const index = splitConditonRowIndex(row.data('index'));
    const condition = ruleOutcomes[index[1]]['conditions'][index[2]][index[3]];
    const fact = row.find('.fact-select').val();
    const operator = row.find('.operator-select').val();
    const value = row.find('.value-select').val() === 'other' ? row.find('.value-text').val() : row.find('.value-select').val();
    condition.fact = fact;
    condition.operator = operator;
    condition.value = value;
    ruleOutcomes[index[1]]['conditions'][index[2]][index[3]] = condition;
    console.log(ruleOutcomes);
    console.log(JSON.stringify(ruleOutcomes));
    submitConditionChanges();
}

const submitConditionChanges = async () => {
    let ruleID = $('#ruleId').val();
    $('#mainSpinner').show();
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({outcomes: ruleOutcomes}),
        success: function(data){
            $('#mainSpinner').hide();
            successToast("Rule updated successfully");
            loadOutcomes();
        },
        error: function(err){
            $('#mainSpinner').hide();
            console.log(err);
            errorToast("Error updating rule: \n"+err.responseJSON.message);
        }
    });
}

const addConditionRow = ($row) => {
    const index = splitConditonRowIndex($row.data('index'));
    console.log(index);
    const newCondition = {fact: '', operator: 'equal', value: ''};
    ruleOutcomes[index[1]]['conditions'][index[2]].push(newCondition);
    renderRuleConditions();
    const newRuleConditionIndex = `condition/${index[1]}/${index[2]}/${ruleOutcomes[index[1]]['conditions'][index[2]].length - 1}`;
    console.log(newRuleConditionIndex);
    const $newRow = $(`tr[data-index="${newRuleConditionIndex}"]`);
    convertRowToForm($newRow);
    $newRow.addClass('form-converted');
}

const errorToast = (message) => {
    initializeRuleToast();
    $('#statusToastHeader').text("Error!").addClass("text-danger").removeClass("text-success");
    $('#statusToastBody').text(message);
    ruleToast.show();
}
const successToast = (message) => {
    initializeRuleToast();
    $('#statusToastHeader').text("Success!").addClass("text-success").removeClass("text-danger");
    $('#statusToastBody').text(message);
    ruleToast.show();
};