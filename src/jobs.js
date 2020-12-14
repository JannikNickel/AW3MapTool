const fileloader = require("./file-loader");
const filecompression = require("./file-compression");

module.exports.decompressJob = async function(progressCallback, filePath) {
    return new Promise(async function(resolve, reject) {
        let file = await fileloader.loadFile(filePath, (p) => { progressCallback(p * 0.5); }).catch(reject);
        if(filecompression.isCompressed(file) == false) {
            reject("The file is not compressed!");
        }
        let decompressed = await filecompression.decompressFile(file, (p) => { progressCallback(0.5 + p * 0.5); }).catch(reject);
        resolve(decompressed);
    });
};

module.exports.compressJob = async function(progressCallback, filePath) {
    return new Promise(async function(resolve, reject) {
        let file = await fileloader.loadFile(filePath, (p) => { progressCallback(p * 0.5); }).catch(reject);
        if(filecompression.isCompressed(file) == true) {
            reject("The file is already compressed!");
        }
        let compressed = await filecompression.compressFile(file, (p) => { progressCallback(0.5 + p * 0.5); }).catch(reject);
        resolve(compressed);
    });
};
