const pinoHttp = require('pino-http');
const pino = require('pino');
const fs = require('fs');

const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || './logs';
const logPath = process.env.LOG_PATH || './logs/app.log';

if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir, { recursive: true });
}

const loggerInstance = pino({
    level: logLevel,
}, pino.destination(logPath));

const options = {
    logger: loggerInstance,
    customLogLevel: function (res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
        } else if (res.statusCode >= 500 || err) {
            return 'error';
        }
        return 'info';
    },
    customSuccessMessage: function (res) {
        if (res.statusCode === 404) {
            return 'Resource not found';
        }
        return 'Request completed';
    },
    customErrorMessage: function (error, res) {
        return 'Request errored with status code: ' + res.statusCode;
    },
};

const logger = pinoHttp(options);

module.exports = logger;