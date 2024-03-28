const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const APIKeySchema = new Schema({
    name: { type: String, required: true },
    key: { type: String, unique: true, required: true},
    isActive: { type: Boolean, default: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    createdDate: { type: Date, default: Date.now },
});

APIKeySchema.pre('save', function(next) {
    const apiKey = this;
    if(!apiKey.isModified('key')) return next();
    apiKey.key = crypto.randomBytes(32).toString('hex');
    next();
});

APIKeySchema.methods.compareKey = function(candidateKey, cb) {
    if(candidateKey === this.key) return cb(null, true);
}

const APIKey = mongoose.model('APIKey', APIKeySchema);

module.exports = APIKey;