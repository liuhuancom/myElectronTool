const { Client } = require('ssh2');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');



function upload1(){
    console.log('upload1');
}

function ssh_test(conf, cbdata, cbclose, cderr){
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.exec('uptime', (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('连接关闭 Stream :: close :: code: ' + code + ', signal: ' + signal);
                cbclose && cbclose(code, signal);
                conn.end();
            }).on('data', (data) => {
                cbdata && cbdata(data);
                // console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                cderr && cderr(data)
                console.log('STDERR: ' + data);
            });
        });
    }).connect(conf);
}

function handle_zip(name, local_path, cb, err){
    // 打包的zip文件
    let zip_name =  `${name}.zip`;
    // zip文件路径
    let zipFilePath = path.join(local_path, '../', zip_name);

    let output = fs.createWriteStream(zipFilePath);
    let archive = archiver('zip', {
        zlib: {
            level: 9
        }
    });

    output.on('close', function () {
        cb && cb({
            file:zipFilePath
        });
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    archive.on('error', function (e) {
        err && err(e);
        throw err;
    });
    archive.pipe(output);
    archive.directory(local_path, false);
    archive.finalize();

}


function upload_server(ssh_conf, local, remote, cbprogess, cbok, err){
    // let zipname = `${name}.zip`;
    // let zipFilePath = path.join(local, '../', zipname)
    // let remoteZipFilePath = path.join(remotePath, zipname)
    // let remoteZipFilePathPosix = path.posix.join(remotePath, zipname)

    // console.log('zipFilePath ' + zipFilePath);
    // console.log('remoteZipFilePath ' + remoteZipFilePath);
    // console.log('remoteZipFilePathPosix ' + remoteZipFilePathPosix);

    let zipFilePath = local;
    let remoteZipFilePathPosix = remote;

    console.log('upload_server local', local);
    console.log('upload_server remote', remote);


    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready 准备上传文件');
        conn.sftp((err, sftp) => {
            if (err) throw err;
            sftp.fastPut(zipFilePath, remoteZipFilePathPosix, {
                step: function (total, nb, fsize) {
                    let progess = Math.round(total / fsize * 100)
                    console.log('upload progess ' + progess + '%');
                    cbprogess && cbprogess(progess)
                    // me.uploadProgress = progess;
                }
            }, (e) => {
                err && err(e);
                if (err) throw err;
                console.log('上传完成');
                conn.end();
                // 删掉本地的zip文件
                // if (fs.existsSync(zipFilePath)) {
                //     console.log('删掉本地zip文件 ' + zipFilePath)
                //     fs.unlinkSync(zipFilePath);
                // }
                // me.unzip(remoteZipFilePath);
                cbok && cbok();
            });
        });
    }).connect(ssh_conf);



}



function unzip_server(ssh_conf, zipPathFile, cbdata, cbclose, cberr) {
    let zipName = path.basename(zipPathFile);
    let dir_name = path.dirname(zipPathFile);
    let cmd = `cd ${dir_name} && unzip -o ${zipName}`;
    console.log("远程执行的命令 ", cmd);

    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.exec(cmd, (err, stream) => {
            cberr && cberr(e);
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('连接关闭 Stream :: close :: code: ' + code + ', signal: ' + signal);
                cbclose && cbclose(code, signal);
                conn.end();
            }).on('data', (data) => {
                // console.log('STDOUT: ' + data);
                cbdata && cbdata(data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: 出现错误' + data);
            });
        });
    }).connect(ssh_conf);

}



// module.exports = upload;
// module.exports = upload1;

module.exports = {
    ssh_test,
    handle_zip,
    upload_server,
    unzip_server,
    upload1
};