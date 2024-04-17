var ruleModal;

const initializeRuleModal = () => {
    ruleModal = new bootstrap.Modal(document.getElementById("ruleModal"), {});
}

const createRuleModal = () => {
    let modalBody = renderFromTemplate("newRuleModalTemplate", {});
    $('#ruleModalBody').html(modalBody);
    $('#ruleModalTitle').text("Create Rule");
    initializeRuleModal();
    ruleModal.show();
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
};

const submitNewRule = async () => {
    const formData = {
        name: $('#ruleName').val(),
        description: $('#ruleDescription').val(),
    };
    $('#newRuleModalSaveBtn').prop('disabled', true);
    $.ajax({
        url: '/api/v1/rules',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(data) {
            window.location.href = '/rule/'+data._id;
        },
        error: function(err) {
            console.log(err);
            alert("Error creating rule. Please try again.");
            $('#newRuleModalSaveBtn').prop('disabled', false);
        }
    });
};