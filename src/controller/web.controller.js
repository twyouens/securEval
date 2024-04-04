const User = require('../models/user.model');

function login (req, res) {
    res.render("login", {error: null});
}

async function loginPassword (req, res) {
    const {username, password} = req.body;
    const user = await User.findOne({username: username});
    if(!user){
        return res.status(404).render('login', {error: 'invalid'});
    }
    if(!await user.comparePassword(password)){
        return res.status(404).render('login', {error: 'invalid'});
    }
    if(!user.isActive){
        return res.status(404).render('login', {error: 'invalid'});
    }
    const token = user.createJWTToken();
    res.cookie('token', token, {httpOnly: true, maxAge: parseInt(process.env.JWT_EXPIRY)*1000, path: '/'});
    res.redirect('/');
}
    

module.exports = {
    login,
    loginPassword
};