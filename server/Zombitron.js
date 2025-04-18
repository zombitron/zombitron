const OSCSendor = require("./OSCSendor");
const path = require('path');
let buffer = null;
try {
    buffer = require('node:buffer');
} catch (ex) {
    console.log("node:buffer not defined")
}
if (!buffer) {
    buffer = require('buffer');
}
const { Blob } = buffer; // not on node v12
const fs = require('fs');
class Zombitron {
    https_enabled;
    server;
    port;
    protocol;
    constructor(configfile = "setup.json") {
        let config = JSON.parse(fs.readFileSync("./zombitron/setup/" + String(configfile)))
        this.https_enabled = config.https;
        this.protocol = "http";
        if (this.https_enabled) {
            this.protocol = "https";
        }
        this.port = config.server_port;
        this.osc = null;
        if (config.osc) {
            this.osc = new OSCSendor(config.osc.ip, config.osc.port);
        }
        // initialize express
        this.express = require('express');
        this.app = this.express();
        this.server = this.init_server();

        // initialize hostnames
        this.hostname = '';
        const { networkInterfaces, hostname } = require('os');
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    this.hostname = net.address;
                }
            }
        }

        const WebSocket = require('ws');
        const server = this.server;
        this.socketServer = new WebSocket.Server({ server });
        this.init_socket();
        this.init_paths();
    }

    init_paths() {
        this.app.use('/scripts', this.express.static(__dirname + '/../../node_modules'));
        this.app.use('/zombitron', this.express.static(__dirname + '/../../zombitron'));
        this.app.get('/certificate', function (req, res) {
            res.sendFile(path.resolve(__dirname + '/../../zombitron/setup/certs/server.crt'));
        });
        this.app.use('/assets', this.express.static(__dirname + '/../../assets'));
        const fs = require('fs');
        fs.readdir("./views", (err, files) => {
            console.log("Interfaces found:")
            files.forEach(file => {
                if (file.split(".").length > 1) {
                    if (file.split(".")[1] == "html") {
                        const name = file.split(".")[0];
                        if (name != 'index') {
                            this.app.get('/' + name, function (req, res) {
                                res.sendFile(path.resolve(__dirname + '/../../views/' + file));
                            });
                            console.log("> " + name + " : " + `${this.protocol}://${this.hostname}:${this.port}/${name}`)
                            // console.log(`${this.protocol}://${this.hostname}:${this.port}/${name}`);
                        } else {
                            this.app.get('/', function (req, res) {
                                res.sendFile(path.resolve(__dirname + '/../../views/index.html'));
                            });
                            console.log("> " + name + " : " + `${this.protocol}://${this.hostname}:${this.port}/`)
                        }
                    }
                }
            });
        });
    }

    init_server() {
        let http;
        let server;
        const fs = require('fs');
        if (this.https_enabled) {
            http = require('https');
            const options = {
                key: fs.readFileSync(__dirname + '/../setup/certs/server.key'),
                cert: fs.readFileSync(__dirname + '/../setup/certs/server.crt')
            };
            server = http.createServer(options, this.app);
        } else {
            http = require('http');
            server = http.createServer(this.app);
        }
        return server;
    }

    parseMsg(value) {
        let object = JSON.parse(value);
        Object.keys(object.data).forEach((key) => {
            const value = object.data[key];
            console.log(key, value)
            if (this.osc) {
                try {
                    this.osc.message(key, value);
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }

    init_socket() {
        let sockets = [];
        this.socketServer.on('connection', (socket) => {
            sockets.push(socket);
            console.log('new connection')
            socket.on('message', (msg) => {
                let file;
                if (Blob) {
                    file = new Blob([msg], { type: 'application/json' });
                    file.text()
                        .then(value => {
                            this.parseMsg(value);
                        })
                        .catch(error => {
                            console.log("Something went wrong" + error);
                        });
                } else { // node 12
                    file = Buffer.from(msg, 'application/json');
                    this.parseMsg(file);
                }
                sockets.forEach(s => s.send(msg));
            });
            socket.on('close', function () {
                sockets = sockets.filter(s => s !== socket);
            });
        });
    }

    start() {
        this.server.listen(this.port, () => {
            console.log('ZOMBITRON STARTED :) \n')
        });
    }
}
module.exports = Zombitron