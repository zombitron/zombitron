class Zombitron {
    https_enabled;
    server;
    port;
    constructor(https = false, port = 3000) {
        this.https_enabled = https;
        this.port = port;

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
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    this.hostnames.push(net.address);
                }
            }
        }

        const WebSocket = require('ws');
        const server = this.server;
        this.socketServer = new WebSocket.Server({ server });

        this.app.use('/scripts', this.express.static(__dirname + '/../../node_modules'));
        this.app.use('/zombitron', this.express.static(__dirname + '/../../zombitron'));
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

    start() {
        this.server.listen(this.port, () => {
            console.log(`listening on:`);
            this.hostnames.forEach(hostname => {
                let protocol = "http";
                if(this.https_enabled) {
                    protocol = "https";
                }
                console.log(`- ${protocol}://${hostname}:${this.port}`);
            })
        });
    }
}
module.exports = Zombitron