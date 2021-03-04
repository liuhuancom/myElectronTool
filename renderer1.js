
const { ipcRenderer } = require('electron');

ipcRenderer.send('do-some',1,2);

