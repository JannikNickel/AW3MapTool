const path = require("path");
const ipc = require("electron").ipcRenderer;
const UIState = require("../src/ui-state");
const JobData = require("../src/job-data");
const CompressionJobData = require("../src/compression-job-data");

//Elements
var decompressTab = document.getElementById("decompressTab");
var compressTab = document.getElementById("compressTab");
var tabs = [decompressTab, compressTab];
var sourcePathText = document.getElementById("sourcePath");
var sourceButton = document.getElementById("sourceButton");
var workButton = document.getElementById("workButton");
var workButtonText = document.getElementById("workButtonText");
var workProgressbar = document.getElementById("workProgress");

//Settings
let tabSelectedColor = "rgba(47, 134, 236, 0.5)";
let tabSelectedOpacity = 0.8;
let tabJobNames = ["Decompress", "Compress"];

//State vars
let jobData = new JobData();
let state = new UIState();
resetJobData(0);
updateUI(state, jobData);

//Title control button events
document.getElementById("minButton").addEventListener("click", () => {
    window.minimizeCurrentWindow();
});
document.getElementById("closeButton").addEventListener("click", () => {
    window.closeCurrentWindow();
});

//Tab events
for(let i = 0; i < tabs.length; i++) {
    const element = tabs[i];
    element.addEventListener("click", () => {
        state = new UIState();
        state.mode = i;
        resetJobData(state.mode);
        updateUI(state, jobData);
    });
}

//Control events
sourceButton.addEventListener("click", () => {
    ipc.send("select-source-file");
});
workButton.addEventListener("click", () => {
    if(jobData.isRunning == true) {
        return;
    }
    jobData.isRunning = true;
    updateUI(state, jobData);
    if(jobData.hasResult() == false) {
        ipc.send("run-job", state.mode, jobData);
    }
    else {
        ipc.send("save-result", state.mode, jobData.result);
    }
});

//Invoke this to update the ui
function updateUI(state, jobData){
    for(let i = 0; i < tabs.length; i++) {
        const element = tabs[i];
        element.style.opacity = state.mode == i ? tabSelectedOpacity : null;
        element.style.backgroundColor = state.mode == i ? tabSelectedColor : null;
    }
    workButton.style.display = jobData.allowRun() == false ? "none" : null;
    workButtonText.innerHTML = jobData.hasResult() == true ? "Save" : tabJobNames[state.mode];
    workProgressbar.value = jobData.isRunning == true || jobData.hasResult() == true ? workProgressbar.value : 0.0;
    workProgressbar.style.display = jobData.isRunning == true || jobData.hasResult() == true ? null : "none";

    if(state.mode == 0 || state.mode == 1) {
        sourcePathText.innerHTML = jobData.filePath != null ? path.basename(jobData.filePath) : ("Click on the button to select a file to " + tabJobNames[state.mode].toLowerCase() + "...");
    }
}

function resetJobData(mode) {
    if(mode == 0 || mode == 1) {
        jobData = new CompressionJobData();
    }
    else {
        jobData = new JobData();
    }
}

function reset() {
    state.step = 0;
    resetJobData(state.mode);
    updateUI(state, jobData);
}

ipc.on("selected-source-file", (event, filePath) => {
    if(state.mode == 0 || state.mode == 1) {
        jobData.filePath = filePath;
        updateUI(state, jobData);
    }
});

ipc.on("update-job-progress", (event, progress) => {
    workProgressbar.value = progress * workProgressbar.max;
});

ipc.on("job-completed", (event, result, error) => {
    jobData.isRunning = false;
    if(error != null) {
        reset();
        return;
    }
    jobData.result = result;
    updateUI(state, jobData);
});

ipc.on("result-saved", (event) => {
    reset();
});
