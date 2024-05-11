const fs = require('fs');

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 8);
    return `${date} ${time}`;
}

function logToFile(message) {
    const dateTime = getCurrentDateTime();
    const logMessage = `(${dateTime}) - ${message}`;
    const logStream = fs.createWriteStream('./log-file/logs.txt', { flags: 'a' });
    logStream.write(`${logMessage}\n`);
    logStream.end();
}

const logger = {
    info: (message) => logToFile(`[INFO] --> ${message}`),
    warn: (message) => logToFile(`[WARN] --> ${message}`),
    error: (message) => logToFile(`[ERROR] --> ${message}`),
};

module.exports = logger;
