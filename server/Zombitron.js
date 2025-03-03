const OSCSendor = require("./OSCSendor");
let buffer = null;
try {
    buffer = require('node:buffer');
} catch (ex) {
    console.log("node:buffer nnot defined")
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
    constructor(configfile = "setup.json") {
        let config = JSON.parse(fs.readFileSync("./" + String(configfile)))
        this.https_enabled = config.https;
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
        this.hostnames = ["localhost", "*"];
        const { networkInterfaces, hostname } = require('os');
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    this.hostnames.push(net.address);
                }
            }
        }

        const WebSocket = require('ws');
        const server = this.server;
        this.socketServer = new WebSocket.Server({ server });
        this.init_socket();

        this.app.use('/scripts', this.express.static(__dirname + '/../../node_modules'));
        this.app.use('/zombitron', this.express.static(__dirname + '/../../zombitron'));
        this.app.get('/certificate', function (req, res) {
            res.sendFile(__dirname + '/../../zombitron/server/certs/server.crt');
        });
    }

    init_server() {
        let http;
        let server;
        const fs = require('fs');
        if (this.https_enabled) {
            http = require('https');
            const options = {
                key: fs.readFileSync(__dirname + '/certs/server.key'),
                cert: fs.readFileSync(__dirname + '/certs/server.crt')
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
                            parseMsg(value);
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
            console.log(`listening on:`);
            this.hostnames.forEach(hostname => {
                let protocol = "http";
                if (this.https_enabled) {
                    protocol = "https";
                }
                console.log(`- ${protocol}://${hostname}:${this.port}`);
            })
        });
    }
}
module.exports = Zombitron