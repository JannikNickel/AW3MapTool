const zlib = require("zlib");

module.exports.decompressFile = async function(bytes, progress) {
    if(this.isCompressed(bytes) == false) {
        progress(1.0);
        return bytes.toString("UTF-8");
    }
    return new Promise(function(resolve, reject) {
        let str = bytes.toString("UTF-8");
        progress(0.5);
        zlib.gunzip(Buffer.from(str, "base64"), function(err, uncompressed) {
            progress(1.0);
            if(err) {
                reject(err);
            }
            else {
                resolve(uncompressed.toString());
            }
        });
    });
};

module.exports.compressFile = async function(bytes, progress) {
    if(this.isCompressed(bytes) == true) {
        progress(1.0);
        return bytes.toString("UTF-8");
    }
    return new Promise(function(resolve, reject) {
        let str = bytes.toString("UTF-8");
        progress(0.5);
        zlib.gzip(Buffer.from(str, "UTF-8"), function(err, uncompressed) {
            progress(1.0);
            if(err) {
                reject(err);
            }
            else {
                resolve(uncompressed.toString("base64"));
            }
        });
    });
};

module.exports.isCompressed = function(bytes) {
    let utfStr = bytes.toString("UTF-8");
    return utfStr.startsWith("<?xml") == false;
}
