class OSCSendor {
    constructor(ip = null, port = null) {
        if(ip && port){
            this.output = {ip: ip, port: port};
            this.input = null;
            this.OSC = require('osc-js');
            let event = null;
            try {
                event = require('node:event');
            } catch (ex) {
                console.log("node:event not defined")
            }
            if(!event){
                event = require('events');
            }
            const EventEmitter = event;
            this.eventEmitter = new EventEmitter();
            this.socket = require('dgram').createSocket("udp4");
            this.socket.on("error", function (err) {
                console.log("Socket error: " + err);
            });
        }
    }

    message(oscaddress, value = "") {
        let message = new this.OSC.Message(oscaddress, value);
        let binary = message.pack()
        try{
            this.socket.send(Buffer.from(binary), 0, binary.byteLength, this.output.port, this.output.ip, function (err, bytes) { console.log(err, bytes)});
        }catch(e){

        }
    }
}
module.exports = OSCSendor