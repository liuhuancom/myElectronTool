const path = require('path')
const glob = require('glob')

const { app, BrowserWindow, Notification, ipcMain } = require('electron');


const debug = /--debug/.test(process.argv[2])


const Store = require('electron-store');
const store = new Store();
app.store = store






let mainWindow = null




function initialize() {
    // makeSingleInstance();

    loadMainProcess();

    function createWindow() {
        const windowOptions = {
            width: 1080,
            minWidth: 680,
            height: 840,
            title: app.getName(),
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
            }
        }

        // if (process.platform === 'linux') {
        //     windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')
        // }

        mainWindow = new BrowserWindow(windowOptions)
        // mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
        mainWindow.loadFile('render/main.html')

        // 在打开 DevTools 的情况下全屏启动, 用法: npm run debug
        if (debug) {
            mainWindow.webContents.openDevTools()
            // mainWindow.maximize()
            // require('devtron').install()
        }

        mainWindow.on('closed', () => {
            mainWindow = null
        })
    }

    app.on('ready', () => {
        createWindow()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow()
        }
    })
}

// 将此应用程序设为单个实例应用程序。
//
// 当尝试启动第二个实例时，将恢复并聚焦到主窗口，
// 而不是打开第二个窗口。
//
// 如果应用程序的当前版本应该退出而不是启动，
// 则返回true.
function makeSingleInstance() {
    if (process.mas) return

    app.requestSingleInstanceLock()

    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

// 在主进程目录中需要的每个 JS 文件
function loadMainProcess() {
    // const files = glob.sync(path.join(__dirname, 'main/**/*.js'))
    const files = glob.sync(path.join(__dirname, 'main/*.js'))
    files.forEach((file) => { require(file) })
}

initialize()




// ipcMain.handle('tfdevopen',function(e,a){
//     // console.log('tfdevopen',e);
//     console.log('tfdevopen',a);
// })

ipcMain.on('tfdevopen',function(e,a){
    // console.log('tfdevopen',e,a);
    console.log('tfdevopen',a);
})

