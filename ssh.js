const { readFileSync } = require('fs');
// const { app, BrowserWindow, Notification, ipcMain } = require('electron')

// console.log('app',app.getPath('userData '));
// const electron = require('electron');
// const configDir =  (electron.app || electron.remote.app).getPath('userData');
// console.log(configDir);
const Store = require('electron-store');

// const store = new Store();



const { Client } = require('ssh2');


$('#set_data').on('click',(e)=>{
    console.log('set_data');
    store.set('unicorn', '🦄');
    console.log(store.get('unicorn'));
    store.set('foo.bar', true);
    console.log(store.get('foo'));
})


$('#get_data').on('click',(e)=>{
    console.log('get_data');
    // store.set('unicorn', '🦄');
    console.log(store.get('unicorn'));
    // store.set('foo.bar', true);
    console.log(store.get('foo'));
})


// let btn_login = document.getElementById('btn_login');
// console.log(btn_login);
$('#btn_login').on('click', function (e) {
    console.log('btn_login');
    let name = $('#ssh_name').val();
    let passwd = $('#ssh_passwd').val();
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.exec('uptime', (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', (data) => {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });
    }).connect({
        host: '8.130.54.255',
        port: 22,
        username: name,
        password: passwd,
        //   privateKey: readFileSync('/path/to/my/key')
    });

})


// const conn = new Client();
// conn.on('ready', () => {
//     console.log('Client :: ready');
//     conn.exec('uptime', (err, stream) => {
//         if (err) throw err;
//         stream.on('close', (code, signal) => {
//             console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
//             conn.end();
//         }).on('data', (data) => {
//             console.log('STDOUT: ' + data);
//         }).stderr.on('data', (data) => {
//             console.log('STDERR: ' + data);
//         });
//     });
// }).connect({
//     host: '8.130.54.255',
//     port: 22,
//     username: 'root',
//     password: 'AfcV96BzWbc4Fvd7',
//     //   privateKey: readFileSync('/path/to/my/key')
// });



