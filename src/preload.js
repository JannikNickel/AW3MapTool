const { remote } = require("electron");

//Window controls
let currentWindow = remote.getCurrentWindow();
window.minimizeCurrentWindow = function() {
    currentWindow.minimize();
};
window.maximizeCurrentWindow = function() {
    currentWindow.maximize();
};
window.closeCurrentWindow = function() {
    currentWindow.close();
};
