const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConditionSchema = new Schema({
    fact: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
});

// Define a schema for outcomes
const OutcomeSchema = new Schema({
    conditions: {
        all: [ConditionSchema],
        any: [ConditionSchema]
    }
});

// Define the main rule schema
const RuleSchema = new Schema({
    name: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String, required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    targets: [{ type: String, required: false }], 
    facts: [{
        name: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        type: { type: String, required: true },
        source: { type: String, required: true }
    }],
    outcomes: {
        allowed: { type: OutcomeSchema, required: false },
        "additional-information": { type: OutcomeSchema, required: false },
        denied: { type: OutcomeSchema, required: false }
    },
    outcomeRanking: [{ type: String, required: true }]
});

const Rule = mongoose.model('Rule', RuleSchema);

module.exports = Rule;