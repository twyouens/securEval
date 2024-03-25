const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TenantSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now },
    tenantType: { type: String, required: true },
    website: { type: String, required: false },
});

const Tenant = mongoose.model('Tenant', TenantSchema);

module.exports = Tenant;