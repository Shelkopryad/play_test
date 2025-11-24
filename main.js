const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

const { chromium } = require('playwright');

let pwBrowser = null;
let pwContext = null;
let pwPage = null;

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 320,
        alwaysOnTop: true,
        frame: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

let sessionLogs = [];

ipcMain.handle('start-test', async (event, opts) => {
    if (pwBrowser) {
        return { ok: false, message: 'Test already running' };
    }
    try {
        // ensure videos dir exists
        const videosDir = path.join(__dirname, 'videos', 'temp');
        fs.mkdirSync(videosDir, { recursive: true });

        pwBrowser = await chromium.launch({ headless: false });
        pwContext = await pwBrowser.newContext({
            viewport: { width: 1280, height: 720 },
            recordVideo: { dir: videosDir, size: { width: 1280, height: 720 } }
        });

        // Reset logs
        sessionLogs = [];

        // Expose function to collect logs from browser
        await pwContext.exposeFunction('logAction', (action) => {
            sessionLogs.push({
                ...action,
                timestamp: Date.now()
            });
        });

        // Inject script to listen for events
        await pwContext.addInitScript(() => {
            function getSelector(el) {
                if (el.id) return `#${el.id}`;
                if (el.className) return `.${el.className.split(' ').join('.')}`;
                return el.tagName.toLowerCase();
            }

            document.addEventListener('click', (e) => {
                window.logAction({
                    type: 'click',
                    selector: getSelector(e.target),
                    text: e.target.innerText ? e.target.innerText.substring(0, 50) : ''
                });
            }, true);

            document.addEventListener('change', (e) => {
                window.logAction({
                    type: 'change',
                    selector: getSelector(e.target),
                    value: e.target.value
                });
            }, true);
        });

        pwPage = await pwContext.newPage();

        // Open about:blank or a starting page
        await pwPage.goto('about:blank');

        return { ok: true, message: 'Browser started. Interact with it manually.' };
    } catch (err) {
        console.error(err);
        return { ok: false, message: String(err) };
    }
});

ipcMain.handle('pass-test', async () => {
    if (!pwPage) return { ok: false, message: 'No test running' };
    try {
        // Close page to flush video
        await pwPage.close();

        // get video path(s) - page.video().path() available after close
        let videoPath = null;
        try {
            videoPath = await pwPage.video().path();
        } catch (e) {
            // Some versions might need different timing; ignore if none
            console.warn('Could not get video path:', e);
        }

        // Close context & browser
        await pwContext.close();
        await pwBrowser.close();

        // reset
        pwPage = pwContext = pwBrowser = null;
        sessionLogs = [];

        // remove video if exists (since test passed)
        if (videoPath && fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }

        return { ok: true, message: 'Test marked PASSED; video removed.' };
    } catch (err) {
        console.error(err);
        return { ok: false, message: String(err) };
    }
});

ipcMain.handle('fail-test', async () => {
    if (!pwPage) return { ok: false, message: 'No test running' };
    try {
        await pwPage.close();

        let videoPath = null;
        try {
            videoPath = await pwPage.video().path();
        } catch (e) {
            console.warn('Could not get video path:', e);
        }

        await pwContext.close();
        await pwBrowser.close();

        pwPage = pwContext = pwBrowser = null;

        if (videoPath && fs.existsSync(videoPath)) {
            const now = new Date();
            const folderName = now.toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
            const savedDir = path.join(__dirname, 'videos', 'failed', folderName);
            fs.mkdirSync(savedDir, { recursive: true });

            const fileName = `video.webm`;
            const dest = path.join(savedDir, fileName);
            fs.renameSync(videoPath, dest);

            // Save scenario logs
            const scenarioPath = path.join(savedDir, 'scenario.json');
            fs.writeFileSync(scenarioPath, JSON.stringify(sessionLogs, null, 2));

            return { ok: true, message: `Test marked FAILED; saved to ${savedDir}`, path: savedDir };
        } else {
            return { ok: true, message: 'Test marked FAILED; no video file found.' };
        }
    } catch (err) {
        console.error(err);
        return { ok: false, message: String(err) };
    }
});

ipcMain.handle('abort-test', async () => {
    try {
        if (pwContext) await pwContext.close();
        if (pwBrowser) await pwBrowser.close();
    } catch (_) { }
    pwPage = pwContext = pwBrowser = null;
    return { ok: true };
});

ipcMain.handle('open-path', async (event, path) => {
    const { shell } = require('electron');
    await shell.showItemInFolder(path);
});
