const JobData = require("./job-data");

module.exports = class CompressionJobData extends JobData {
    constructor() {
        super();
        this.filePath = null;
    }

    allowRun() {
        return this.filePath != null;
    }
};