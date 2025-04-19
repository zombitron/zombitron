#! /usr/bin/env node
const e = require('express');
var data = require('./setup.json');
var fs = require('fs');
const readline = require('node:readline');
const { resolve } = require('node:path');

const { exec } = require('child_process');
const certificateDirectory = "zombitron/setup/certs";
const { networkInterfaces, hostname } = require('os');
const nets = networkInterfaces();

exports.sethttps = function (v) {
    return new Promise((resolve, reject) => {
        data.https = (v == 'true');
        exports.writedata();
        resolve();
    })
}

exports.setsecureserver = function (v) {
    return new Promise((resolve, reject) => {
        if (v == "y") {
            console.log('Yes ! Ok I will make the setup for you.')
            exports.sethttps('true').then((e) => {
                exports.makecerts().then((e) => {
                    resolve();
                });
            })
        } else {
            exports.sethttps('false').then((e) => {
                resolve();
            });
            console.log('Ok, in any case you will still be able to activate it later, by running `npm run secureserver`')
        }
    });
}

exports.setosc = async function (rl) {
    return new Promise((resolve, reject) => {
        if (data.osc) {
            rl.question("OSC communication is currently On. \n Do you want to deactivate it? (y/n) ", v => {
                if (v == 'n') {
                    exports.enableosc(rl).then(e => {
                        resolve();
                    });
                } else {
                    data.osc = null;
                    exports.writedata();
                    console.log('Ok, I deactivated it. You will still be able to reactivate it later, by running `npm run set-osc`')
                    resolve();
                }
            })
        } else {
            console.log('OSC communication is currently off.');
            rl.question("Do you want to activate it? (y/n) ", ans => {
                if (ans == "y") {
                    data.osc = {};
                    exports.enableosc(rl).then(e => {
                        resolve();
                    });
                } else {
                    data.osc = null;
                    console.log('Ok, in any case you will still be able to activate it later, by running `npm run set-osc`')
                    resolve();
                }
            });
        }
    });
}

exports.writedata = function () {
    fs.writeFile(__dirname + '/setup.json', JSON.stringify(data), function (e) { });
}

exports.enableosc = function (rl) {
    return new Promise((resolve, reject) => {
        if (data.osc.ip) {
            console.log('The IP is set to ' + data.osc.ip);
            rl.question("Please enter the new ip in the form `123.456.0.1` or just enter to keep this one ", ans => {
                if (ans.split('.').length == 4) {
                    data.osc.ip = ans;
                }
                exports.setoscport(rl).then((e) => {
                    exports.writedata();
                    console.log('Perfect, OSC is now sending to ' + data.osc.ip + ' at port: ' + data.osc.port)
                    resolve();
                });
            });
        } else {
            rl.question("Please enter the new OSC ip in the form `123.456.0.1` ", ans => {
                if (ans.length > 0) {
                    if (ans.split('.').length == 4) {
                        data.osc.ip = ans;
                        exports.setoscport(rl).then((e) => {
                            exports.writedata();
                            resolve();
                        });
                    } else {
                        console.log('This is a weird ip address');
                        exports.enableosc(rl).then(e => {
                            resolve();
                        });
                    }
                } else {
                    console.log('ok, I cancelled the osc setup, you can still set it up by doing `npm run set-osc`');
                    resolve();
                }
            });
        }
    });
}

exports.setoscport = function (rl) {
    return new Promise((resolve, reject) => {
        rl.question('The default port is 8000: enter another one to change it ', ans => {
            if (ans.length > 3) {
                data.osc.port = parseInt(ans);
            } else {
                data.osc.port = 8000;
            }
            resolve();
        });
    });
}

exports.makecerts = function () {
    return new Promise((resolve, reject) => {
        let serverIP = '';
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    serverIP = net.address;
                }
            }
        }
        exec('mkdir ' + certificateDirectory, (err, stdout, stderr) => {
            exec('openssl genrsa -out ' + certificateDirectory + '/server.key 2048', (err, stdout, stderr) => {
                exec('openssl req -new -x509 -sha256 -key ' + certificateDirectory + '/server.key -out ' + certificateDirectory + '/server.crt -days 365 -subj /CN=' + serverIP, (err, stdout, stderr) => {
                    if (!err) {
                        console.log('Created certificate for ip: ' + serverIP);
                        resolve();
                    }
                });
            });
        });
    })
}