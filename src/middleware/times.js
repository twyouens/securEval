const Moment = require("moment");

function moment(req, res, next) {
  req.locals.moment = Moment;
  next();
}

module.exports = {
    moment
};