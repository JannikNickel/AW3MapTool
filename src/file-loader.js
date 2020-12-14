const fs = require("fs");

module.exports.loadFile = async function(filePath, progress) {
    let stat = fs.statSync(filePath);
    const filesize = stat.size;
    let bytesLoaded = 0;

    return new Promise(function(resolve, reject) {
        let chunks = [];
        fs.createReadStream(filePath)
        .on("data", (buffer) => {
            bytesLoaded += buffer.length;
            chunks.push(buffer);
            progress(bytesLoaded / filesize);
        })
        .on("end", () => {
            resolve(Buffer.concat(chunks));
        })
        .on("error", reject);
    });
};

module.exports.saveFile = async function(filePath, data) {
    return new Promise(function(resolve, reject) {
        fs.createWriteStream(filePath, {flags: "w"})
        .on("end", () => {
            resolve();
        })
        .on("error", reject)
        .write(data);
    });
};
