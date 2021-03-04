const { app } = require('electron');
const Store = require('electron-store');

const store = new Store();
app.store = store;

