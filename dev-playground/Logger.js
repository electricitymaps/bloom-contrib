let logs = [];

const log = (level, message) => logs.push({ level, message })

const popLogs = () => {
    const tempLogs = logs;
    logs = [];
    return tempLogs;
}

module.exports.log = log;
module.exports.popLogs = popLogs;