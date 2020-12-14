module.exports = class JobData {
    constructor() {
        this.isRunning = false;
        this.result = null;
    }

    allowRun() {
        return true;
    }

    hasResult() {
        return this.result != null;
    }
};