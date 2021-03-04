const fs = require('fs');
const path = require('path');
const { remote, ipcRenderer } = require('electron');
const { Client } = require('ssh2');
// console.log('remote', remote);
// console.log('remote store', remote.app.store.get('name'));

const utils = require('../utils');

let store = remote.app.store;



let global_connent_conf = null;

set_data_for_store();

$('#save_server').on('click', (e) => {
    console.log('save_server');
    store.set(`${name}.server`, {
        server_ip: $('#server_ip').val(),
        ssh_key: $('#ssh_key').val(),
        root_name: $('#root_name').val(),
        password: $('#password').val(),
        server_port: parseInt($('#server_port').val()),
    });

    $('#server_log').text('保存完成');

    let tfdev = store.get(`${name}.server`);
    console.log('tfdev server ', tfdev);

    let server_ip = store.get(`${name}.server.server_ip`);
    if (!server_ip) {
        $('#server_log').text('没有填写ip');
        return
    }

    let ssh_key = store.get(`${name}.server.ssh_key`);
    let root_name = store.get(`${name}.server.root_name`);
    let password = store.get(`${name}.server.password`);
    let server_port = store.get(`${name}.server.server_port`);

    if (!server_port) {
        server_port = 22;
        store.set(`${name}.server.server_port`, server_port);
        $('#server_port').val(server_port)
    }

    if (!root_name) {
        root_name = 'root'
        store.set(`${name}.server.root_name`, root_name);
        $('#root_name').val(root_name)
    }

    if (!ssh_key && !password) {
        $('#server_log').text('秘钥和密码需要填写一个');
        return
    }

    $('#server_log').text('')



    const connent_data = {
        host: server_ip,
        port: server_port,
        username: root_name,
        // password: password,
    }

    if (ssh_key) {
        connent_data['privateKey'] = fs.readFileSync(ssh_key);
    }
    if (password) {
        connent_data['password'] = password;
    }

    store.set(`${name}.server.connent_data`, connent_data);

    global_connent_conf = connent_data;

    // 连接服务器测试
    utils.ssh_test(connent_data, (d) => {
        $('#server_log').text(d);
    });


});


$('#save_path').on('click', (e) => {
    console.log('save_path');
    store.set(`${name}.local`, {
        local_path: $('#local_path').val(),
        remote_cdn_path: $('#remote_cdn_path').val(),
        remote_php_path: $('#remote_php_path').val(),
    });
    let tfdev = store.get(`${name}.local`);
    console.log('tfdev local ', tfdev);
    $('#local_log').text('保存完成');


});



$('#package').on('click', (e) => {
    // $('#progress').width
    let local_path = $('#local_path').val();
    // let local_path = store.get(`${name}.local.local_path`);
    if (!local_path) {
        $('#local_log').text('没有填写本地项目目录');
        return
    }

    $('#local_log').text('开始打包...');
    utils.handle_zip(name, local_path, (f) => {
        console.log('zip file', f);
        $('#local_log').text('打包完成' + f.file);
    })




});


// 上传
$('#upload').on('click', (e) => {
    // $('#progress').width
    // store.get(`${name}.server.server_ip`)
    let connent_data = store.get(`${name}.server.connent_data`);

    let local_path = $('#local_path').val();
    if (!local_path) {
        $('#local_log').text('没有设置本地路径');
        return
    }

    let remote_cdn_path = $('#remote_cdn_path').val();
    if (!remote_cdn_path) {
        $('#local_log').text('没有设置远程cdn路径');
        return
    }

    let remote_php_path = $('#remote_php_path').val();
    if (!remote_php_path) {
        $('#local_log').text('没有设置远程php路径');
        return
    }
    let zipname = `${name}.zip`;

    let local_zip_path = path.join(local_path, '../', zipname)
    let local_zip_path_posix = path.posix.join(local_path, zipname)
    let remoteCDNZipFilePathPosix = path.posix.join(remote_cdn_path, zipname)
    let remotePHPZipFilePathPosix = path.posix.join(remote_php_path, zipname)

    console.log('local_zip_path', local_zip_path);
    console.log('local_zip_path_posix', local_zip_path_posix);
    console.log('remoteCDNZipFilePathPosix', remoteCDNZipFilePathPosix);
    console.log('remotePHPZipFilePathPosix', remotePHPZipFilePathPosix);

    utils.upload_server(
        global_connent_conf,
        local_zip_path,
        remoteCDNZipFilePathPosix,
        (d) => {
            $('#local_log').text(`上传进度 ${d}`);
        },
        () => {
            $('#local_log').text('上传完成');

            utils.unzip_server(
                global_connent_conf,
                remoteCDNZipFilePathPosix,
                (d) => {
                    $('#local_log').text('数据返回 ', d);
                },
                (c, s) => {
                    $('#local_log').text('解压完成');
                }
            );
        }
    );

    utils.upload_server(
        global_connent_conf,
        local_zip_path,
        remotePHPZipFilePathPosix,
        (d) => {
            $('#local_log').text(`上传进度 ${d}`);
        },
        () => {
            $('#local_log').text('上传完成');

            utils.unzip_server(
                global_connent_conf,
                remotePHPZipFilePathPosix,
                (d) => {
                    $('#local_log').text('数据返回 ', d);
                },
                (c, s) => {
                    $('#local_log').text('解压完成');
                }
            );
        }
    )



});


$('#select').on('click', (e) => {
    console.log('select');
    // ipcRenderer.send('tfdevopen',1111);

    remote.dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(res => {
        // console.log('directory ',res);
        // $('#log').text(JSON.stringify(res));
    }).catch(err => {
        // console.log('directory err',err);
        // $('#log').text(JSON.stringify(err));
    })

});







function set_data_for_store() {


    store.get(`${name}.server.server_ip`) && $('#server_ip').val(store.get(`${name}.server.server_ip`));
    store.get(`${name}.server.ssh_key`) && $('#ssh_key').val(store.get(`${name}.server.ssh_key`));
    store.get(`${name}.server.root_name`) && $('#root_name').val(store.get(`${name}.server.root_name`));
    store.get(`${name}.server.password`) && $('#password').val(store.get(`${name}.server.password`));
    store.get(`${name}.server.server_port`) && $('#server_port').val(store.get(`${name}.server.server_port`));



    store.get(`${name}.local.local_path`) && $('#local_path').val(store.get(`${name}.local.local_path`));
    store.get(`${name}.local.remote_cdn_path`) && $('#remote_cdn_path').val(store.get(`${name}.local.remote_cdn_path`));
    store.get(`${name}.local.remote_php_path`) && $('#remote_php_path').val(store.get(`${name}.local.remote_php_path`));

    let server_ip = store.get(`${name}.server.server_ip`);
    let ssh_key = store.get(`${name}.server.ssh_key`);
    let root_name = store.get(`${name}.server.root_name`);
    let password = store.get(`${name}.server.password`);
    let server_port = store.get(`${name}.server.server_port`);




    const connent_data = {
        host: server_ip,
        port: server_port,
        username: root_name,
        // password: password,
    }
    if (ssh_key) {
        connent_data['privateKey'] = fs.readFileSync(ssh_key);
    }
    if (password) {
        connent_data['password'] = password;
    }

    global_connent_conf = connent_data;


}
