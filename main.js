const { app, BrowserWindow, Notification, ipcMain } = require('electron');

const Store = require('electron-store');

const store = new Store();

app.store = store


// store.set('name', 'liuhuan');
console.log(store.get('name'));

console.log('configdir');

// console.log('app',app.getPath('userData '));

let win
let win1, win2


function createWindow() {

    console.log('aaa createWindow');

    win = new BrowserWindow({
        width: 1800,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    })

    win.webContents.openDevTools();
    win.loadFile('index.html')

    // win.loadURL('http://www.baidu.com')
    // handleIPC();

    // win1 = new BrowserWindow({
    //     width: 300 ,
    //     height: 300,
    //     // frame: false
        
    // })

    // win1.loadFile('index1.html')
    // win1.on('close',()=>{win1 = null});

    // win2 = new BrowserWindow({
    //     width: 300 ,
    //     height: 300,
    //     // frame: false
        
    // })

    // win2.loadFile('index2.html')
    // win2.on('close',()=>{win2 = null});

    global.sharedObject = {
        // win1WebContentsId: win1.webContents.id
    }

    console.log('setTimeout1');
    setTimeout(handleIPC,500);
    console.log('setTimeout2');



}


function log() {
    console.log('ddffd');
}


function showNotification() {
    console.log('showssss');

    const notification = {
        title: 'Basic Notification',
        body: 'Notification from the Main process',
        actions: [{ text: '开始', type: 'button' }],
        closeButtionText: 'ssss',
    }
    let notif = new Notification(notification);
    notif.show();
    notif.on('action', () => {
        console.log('action');
    });
    notif.on('close', () => {
        console.log('close');
    });

    // alert('fdfd');

}



// app.whenReady().then(createWindow).then(showNotification);
// app.whenReady().then(createWindow);


app.on('ready', () => {
    createWindow();
    // const Store = require('electron-store');

    //  store = new Store();
    // setTimeout(handleIPC,500);
    // handleIPC();
    



});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})


function handleIPC(){
    console.log('aaa handleipc');

    ipcMain.on('do-some',(e,a,b)=>{
        console.log('do-some',e,a,b);
    })
}