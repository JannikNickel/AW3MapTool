const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const ipc = require("electron").ipcMain;
const jobs = require("./jobs");
const fileloader = require("./file-loader");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 190,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js")
        },
        frame: false,
        backgroundColor: "#FFF",//Enables subpixel AA
        icon: path.join(__dirname, "web/icons/appicon.png")
    });

    mainWindow.loadFile(path.join(__dirname, "..", "/web/index.html"));
    mainWindow.resizable = false;
}

app.on("ready", () => {
    createWindow();

    app.on("activate", function() {
        if(BrowserWindow.getAllWindows().length == 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    app.quit();
});

//Renderer events
ipc.on("select-source-file", (event) => {
    dialog.showOpenDialog({
        defaultPath: path.join(path.join(process.env.APPDATA, "../"), "LocalLow/Jannik Nickel/Ancient Warfare 3/CustomBattles/"),
        filters: [{name: "Battles/Prefabs", extensions: ["xml"]}],
        properties: ["openFile"]
    }).then(result => {
        if(result.filePaths !== undefined && result.filePaths.length > 0) {
            let source = result.filePaths[0];
            event.sender.send("selected-source-file", source);
        }
    }).catch(err => {
        console.log(err);
    });
});

ipc.on("run-job", async (event, job, jobData) => {
    let result = null;
    let error = null;
    if(job == 0){
        result = await jobs.decompressJob((progress) => {
            event.sender.send("update-job-progress", progress);
        }, jobData.filePath).catch((err) => {
            error = err;
            notificationMessageBox(err);
        });
    }
    else if(job == 1){
        result = await jobs.compressJob((progress) => {
            event.sender.send("update-job-progress", progress);
        }, jobData.filePath).catch((err) => {
            error = err;
            notificationMessageBox(err);
        });
    }
    else {
        console.log("Unknown job");
    }
    event.sender.send("job-completed", result, error);
});

ipc.on("save-result", (event, job, jobResult) => {
    if(job == 0 || job == 1) {
        dialog.showSaveDialog({
            defaultPath: path.join(path.join(process.env.APPDATA, "../"), "LocalLow/Jannik Nickel/Ancient Warfare 3/CustomBattles/"),
            filters: [{name: "Battles/Prefabs", extensions: ["xml"]}],
            properties: ["saveFile"]
        }).then(async (result) => {
            if(result.filePath !== undefined) {
                let filePath = result.filePath;
                await fileloader.saveFile(filePath, jobResult);
            }
        }).catch(err => {
            notificationMessageBox(err);
        });
    }
    else {
        console.log("Unknown job!");
    }
    event.sender.send("result-saved");
});

function notificationMessageBox(notification) {
    dialog.showMessageBoxSync(null, {type: "info", buttons: ["Ok"], title: "Info", message: notification});
}
