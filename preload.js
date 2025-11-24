const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startTest: () => ipcRenderer.invoke('start-test'),
    passTest: () => ipcRenderer.invoke('pass-test'),
    failTest: () => ipcRenderer.invoke('fail-test'),
    abortTest: () => ipcRenderer.invoke('abort-test'),
    openPath: (path) => ipcRenderer.invoke('open-path', path)
});
