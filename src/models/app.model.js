const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now },
    website: { type: String, required: false },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
});

const App = mongoose.model('App', AppSchema);

module.exports = App;
