var ruleModal;
var ruleToast;
var selectedFact = {};
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
            selectedFact = data;
            let modalBody = renderFromTemplate('ruleFactModalTemplate', {fact: selectedFact});
            $('#ruleModalBody').html(modalBody);
            $('#ruleModalTitle').text("Fact");
            if(selectedFact.source === "static"){
                updateFactTypeInputs(selectedFact.type);
            }else{
                $('.value-input').hide();
            }
            initializeRuleModal();
            ruleModal.show();
            addFactModalHandling();
        },
        error: function(err){
            console.log(err);
        }
    });
            
}

const newFactModal = () => {
    selectedFact = {name: '', source: 'static', type: 'string', value: ''};
    let modalBody = renderFromTemplate('ruleFactModalTemplate', {fact: selectedFact});
    $('#ruleModalBody').html(modalBody);
    updateFactTypeInputs(selectedFact.type);
    $('#ruleModalTitle').text("New Fact");
    initializeRuleModal();
    ruleModal.show();
    addFactModalHandling();
};

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

const addFactModalHandling = () => {
    $('#factSource').change(function() {
        var source = $(this).val();
        if (source === "static") {
            updateFactTypeInputs($('#factType').val());
        } else {
            $('.value-input').hide();
        }
    });
    $('#factType').change(function() {
        // Update input fields only if the source is "static"
        if ($('#factSource').val() === "static") {
            updateFactTypeInputs($(this).val());
        }
    });
    $('#addArrayItem').click(function() {
        const newItem = $('#newArrayItem').val().trim();
        if(!/^[a-zA-Z0-9 \-_.]{1,60}$/.test(newItem)){
            $('#newArrayItem').addClass('is-invalid');
            $('#newArrayItemFeedback').text('Invalid Input.');
        }else{
            $('#newArrayItem').removeClass('is-invalid');
            $('#newArrayItemFeedback').text('');
        }
        if (newItem) {
            selectedFact.value.push(newItem);
            populateFactArrayValues();
            $('#newArrayItem').val('')
        }
    });
    $('#arrayItemsList').on('click', '.remove-item', function() {
        const itemText = $(this).siblings('.arrayItemValue').text().trim();
        selectedFact.value = selectedFact.value.filter(item => item != itemText);
        populateFactArrayValues();
    });
};

const updateFactTypeInputs = (factType) => {
    $('.value-input').hide();
    switch (factType) {
        case "string":
            if(typeof selectedFact.value != 'string'){
                selectedFact.value = '';
            }
            $('#string-input').show();
            break;
        case "number":
            if(typeof selectedFact.value != 'number'){
                selectedFact.value = 0;
            }
            $('#number-input').show();
            break;
        case "boolean":
            if(typeof selectedFact.value != 'boolean'){
                selectedFact.value = true;
            }
            $('#boolean-input').show();
            break;
        case "array":
            if(typeof selectedFact.value != 'object'){
                selectedFact.value = [];
            }
            populateFactArrayValues();
            $('#array-input').show();
            break;
        case "timeFrame":
            if(typeof selectedFact.value != 'object'){
                selectedFact.value = [];
            }
            populateFactArrayValues();
            $('#array-input').show();
            break;
        case "dayFrame":
            if(typeof selectedFact.value != 'object'){
                selectedFact.value = [];
            }
            populateFactArrayValues();
            $('#array-input').show();
            break;
        case "monthFrame":
            if(typeof selectedFact.value != 'object'){
                selectedFact.value = [];
            }
            populateFactArrayValues();
            $('#array-input').show();
            break;
    }
};
const populateFactArrayValues = () => {
    $('#arrayItemsList').empty(); // Clear existing list items
    selectedFact.value.forEach(function(item) {
        $('#arrayItemsList').append(`<li class="list-group-item"><span class="arrayItemValue">${item}</span><button type="button" class="btn btn-sm btn-danger float-end remove-item">Remove</button></li>`);
    });
};


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
    let factSelectID = `condition/${index[1]}/${index[2]}/${index[3]}/fact`;
    factCell.html(`<select class='form-control fact-select' id='${factSelectID}'><option disabled>Select Fact</option><option value='${condition.fact}' selected>${condition.fact}</option></select><div class="invalid-feedback" id="${factSelectID}/feedback"></div>`);
    let operatorSelectID = `condition/${index[1]}/${index[2]}/${index[3]}/operator`;
    const conditionOperator = renderFromTemplate('conditionOperatorSelectTemplate', {operator: condition.operator,operatorSelectID: operatorSelectID});
    $row.find("td:nth-child(2)").html(conditionOperator);
    const valueCell = $row.find('td').eq(2);
    let valueSelectID = `condition/${index[1]}/${index[2]}/${index[3]}/value`;
    let valueSelectHtml = `<select class='form-control value-select' id='${valueSelectID}'><option disabled>Select Value</option><option value='other'>Other</option></select><input type='text' class='form-control value-text' style='display:none;' value='${condition.value}' id="${valueSelectID}/value"/><div class="invalid-feedback" id="${valueSelectID}/feedback"></div>`;
    valueCell.html(valueSelectHtml);
    let valueSelect = valueCell.find('.value-select');
    populateValueOptions(valueSelect, condition);
    const $editBtn = $row.find('.btnEditRow');
    $editBtn.text('Save').off('click').on('click', function(event) {
        event.stopPropagation();
        saveConditionRow($row);
    });
    const $deleteBtn = $row.find('.btnDeleteRow');
    $deleteBtn.show();
    $deleteBtn.off('click').on('click', function(event) {
        event.stopPropagation();
        deleteConditionRow($row);
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
    validateAndSaveRule();
}

const validateAndSaveRule = () => {
    let validationErrors = validateRuleOutcomes();
    if(validationErrors !== true){
        errorToast("Invalid rule conditions. Please correct the errors before saving.");
        return null;
    }
    submitConditionChanges();
};

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

const validateRuleOutcomes = () => {
    //clear all feedback messages
    $('.is-invalid').each(function() {
        $(this).removeClass('is-invalid');
    });
    let errors = [];
    Object.entries(ruleOutcomes).forEach(([outcome, detail]) => {
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
            conditions.forEach((condition, i) => {
                if (!condition.fact || !condition.operator || condition.value === undefined) {
                    errors.push({input: "conditions", message: "Condition is missing required fields (fact, operator, value)", conditionType: conditionType, conditionInput: condition});
                }
                if(!(/^(request|static)-([a-zA-Z][a-zA-Z0-9_-]*)$/.test(condition.fact))){
                    appendInputError(`condition/${outcome}/${conditionType}/${i}/fact`, "Invalid fact. Please select Fact.");
                    errors.push({input: "conditions", message: "Invalid fact", conditionType: conditionType, conditionInput: condition.fact});
                }
                if(!(/^(\[((request|static)-[a-zA-Z0-9_-]+)\]|[a-zA-Z0-9_-]+)$/.test(condition.value))){
                    appendInputError(`condition/${outcome}/${conditionType}/${i}/value`, "Invalid value. Please select Value.");
                    errors.push({input: "conditions", message: "Invalid value", conditionType: conditionType, conditionInput: condition.value});
                }
                const validOperators = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'contains'];
                if(!validOperators.includes(condition.operator)){
                    appendInputError(`condition/${outcome}/${conditionType}/${i}/operator`, "Invalid operator. Please select Operator.");
                    errors.push({input: "conditions", message: "Invalid operator", conditionType: conditionType, conditionInput: condition.operator});
                }
            });
        });
    });
    return errors.length > 0 ? errors : true;
};
const appendInputError = (index, message) => {
    const escapedIndex = index.replace(/\//g, '\\/');
    $(`#${escapedIndex}`).addClass('is-invalid');
    $(`#${escapedIndex}\\/feedback`).text(message);
};

const deleteConditionRow = (row) => {
    const index = splitConditonRowIndex(row.data('index'));
    ruleOutcomes[index[1]]['conditions'][index[2]].splice(index[3], 1);
    validateAndSaveRule();
};

const addFirstConditionRow = (outcome, conditionGroup) => {
    const newCondition = {fact: '', operator: 'equal', value: ''};
    ruleOutcomes[outcome]['conditions'][conditionGroup].push(newCondition);
    renderRuleConditions();
    const newRuleConditionIndex = `condition/${outcome}/${conditionGroup}/${ruleOutcomes[outcome]['conditions'][conditionGroup].length - 1}`;
    const $newRow = $(`tr[data-index="${newRuleConditionIndex}"]`);
    convertRowToForm($newRow);
    $newRow.addClass('form-converted');
}

const saveFact = () => {
    selectedFact.name = $('#factName').val();
    selectedFact.source = $('#factSource').val();
    selectedFact.type = $('#factType').val();
    if(selectedFact.source === "static"){
        switch (selectedFact.type) {
            case "string":
                selectedFact.value = $('.factValue.string').val();
                break;
            case "number":
                selectedFact.value = parseFloat($('.factValue.number').val());
                break;
            case "boolean":
                selectedFact.value = $('.factValue.boolean').val() == "true" ? true : false;
                break;
            case "array":
                selectedFact.value = typeof selectedFact.value === 'object' ? selectedFact.value : [];
                break;
            case "timeFrame":
                selectedFact.value = typeof selectedFact.value === 'object' ? selectedFact.value : [];
                break;
            case "dayFrame":
                selectedFact.value = typeof selectedFact.value === 'object' ? selectedFact.value : [];
                break;
            case "monthFrame":
                selectedFact.value = typeof selectedFact.value === 'object' ? selectedFact.value : [];
                break;
        }
    }
    if(!validateFactForm()){
        return;
    }
    if ('_id' in selectedFact) {
        const index = ruleFacts.findIndex(fact => fact._id === selectedFact._id);
        if (index !== -1) {
            ruleFacts[index] = selectedFact;
        } else {
            console.log("Fact with _id not found.");
        }
    } else {
        ruleFacts.push(selectedFact);
    }
    console.log(ruleFacts);
    submitFacts();
};
const frameOptions = (frameType) => {
    let options = [];
    switch (frameType) {
        case "timeFrame":
            options = [
                {name: "00:00", value: "00:00"},{name: "01:00", value: "01:00"},{name: "02:00", value: "02:00"},{name: "03:00", value: "03:00"},{name: "04:00", value: "04:00"},{name: "05:00", value: "05:00"},{name: "06:00", value: "06:00"},{name: "07:00", value: "07:00"},{name: "08:00", value: "08:00"},{name: "09:00", value: "09:00"},{name: "10:00", value: "10:00"},{name: "11:00", value: "11:00"},{name: "12:00", value: "12:00"},{name: "13:00", value: "13:00"},{name: "14:00", value: "14:00"},{name: "15:00", value: "15:00"},{name: "16:00", value: "16:00"},{name: "17:00", value: "17:00"},{name: "18:00", value: "18:00"},{name: "19:00", value: "19:00"},{name: "20:00", value: "20:00"},{name: "21:00", value: "21:00"},{name: "22:00", value: "22:00"},{name: "23:00", value: "23:00"}
            ];
            break;
        case "dayFrame":
            options = [
                {name: "Monday", value: "monday"},
                {name: "Tuesday", value: "tuesday"},
                {name: "Wednesday", value: "wednesday"},
                {name: "Thursday", value: "thursday"},
                {name: "Friday", value: "friday"},
                {name: "Saturday", value: "saturday"},
                {name: "Sunday", value: "sunday"}
            ];
            break;
        case "monthFrame":
            options = [
                {name: "January", value: "january"},
                {name: "February", value: "february"},
                {name: "March", value: "march"},
                {name: "April", value: "april"},
                {name: "May", value: "may"},
                {name: "June", value: "june"},
                {name: "July", value: "july"},
                {name: "August", value: "august"},
                {name: "September", value: "september"},
                {name: "October", value: "october"},
                {name: "November", value: "november"},
                {name: "December", value: "december"}
            ];
            break;
    }
    return options;
};

const validateFactForm = () => {
    if(!/^[a-zA-Z0-9\-_.]{1,60}$/.test(selectedFact.name)){
        $('#factName').addClass('is-invalid');
        $('#factNameFeedback').text('Invalid name');
        return false;
    }
    if(!/^(static|request)$/.test(selectedFact.source)){
        $('#factSource').addClass('is-invalid');
        $('#factSourceFeedback').text('Invalid source');
        return false;
    }
    if(!/^(string|number|boolean|array|timeFrame|dayFrame|monthFrame)$/.test(selectedFact.type)){
        $('#factType').addClass('is-invalid');
        $('#factTypeFeedback').text('Invalid type');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "string" && typeof selectedFact.value !== 'string' && !(/^[a-zA-Z0-9 \-_@!&.]{1,60}$/.test(selectedFact.value))){
        $('.factValue.string').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "number" && typeof selectedFact.value !== 'number'){
        $('.factValue.number').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "boolean" && typeof selectedFact.value !== 'boolean'){
        $('.factValue.boolean').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type)
    if(selectedFact.source === "static" && selectedFact.type === "array" && !Array.isArray(selectedFact.value)){
        $('#factValue').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "timeFrame" && !Array.isArray(selectedFact.value)){
        $('#factValue').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "dayFrame" && !Array.isArray(selectedFact.value)){
        $('#factValue').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    if(selectedFact.source === "static" && selectedFact.type === "monthFrame" && !Array.isArray(selectedFact.value)){
        $('#factValue').addClass('is-invalid');
        $('#factValueFeedback').text('Invalid value');
        return false;
    }
    return true;
};

const submitFacts = async () => {
    let ruleID = $('#ruleId').val();
    $('#mainSpinner').show();
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({facts: ruleFacts}),
        success: function(data){
            $('#mainSpinner').hide();
            successToast("Fact saved successfully");
            ruleModal.hide();
            loadFacts();
        },
        error: function(err){
            $('#mainSpinner').hide();
            errorToast("Error saving fact: \n"+err.responseJSON.message);
        }
    });
};
const loadFacts = async () => {
    let ruleID = $('#ruleId').val();
    $('#mainSpinner').show();
    $.ajax({
        url: '/api/v1/rule/'+ruleID,
        method: 'GET',
        dataType: 'json',
        success: function(data){
            $('#mainSpinner').hide();
            ruleFacts = data.facts;
            renderFacts();
        },
        error: function(err){
            $('#mainSpinner').hide();
            console.log(err);
        }
    });
};
const renderFacts = () => {
    const template = renderFromTemplate('ruleFactsTemplate', {facts: ruleFacts});
    $('#ruleFacts').html(template);
};

const initializeRulePage = () => {
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
            renderFacts();
        },
        error: function(err){
            $('#mainSpinner').hide();
            console.log(err);
        }
    });
};