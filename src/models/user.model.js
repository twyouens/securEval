const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const JWT = require('jsonwebtoken');

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    roles: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdDate: { type: Date, default: Date.now },
});

UserSchema.pre('save', function(next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // Generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);

        // Hash the password using the generated salt
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            // Override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) reject(err);
            resolve(isMatch);
        });
    });
};

UserSchema.methods.createJWTToken = function() {
    return JWT.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(process.env.JWT_EXPIRY),
        data: {
            _id: this._id,
            username: this.username,
            name: this.name,
            tenant: this.tenant,
            roles: this.roles
        }
    }, process.env.JWT_SECRET);
}

const User = mongoose.model('User', UserSchema);

module.exports = User;