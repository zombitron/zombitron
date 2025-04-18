if (!window.zombitron) {
    window.zombitron = {};
}
var zombiterface = function (element) {
    this.socket = null;
    this.element = element;
    this.name = 'noname';
    try {
        this.initialize();
        this.initializeSocket();
        window.addEventListener('beforeunload', function (e) {
            this.send({ 'data': { 'disconnection': this.name } });
        }.bind(this));
        this.socket.addEventListener('open', function () {
            this.send({ 'data': { 'connection': this.name } });
        }.bind(this));
    } catch (er) {
        alert(er);
    }
}

zombiterface.prototype = {
    initialize: function () {
        // initializing interfaces
        var options = this.element.getAttribute('data-zombitron');
        if (options) {
            options = JSON.parse(options);
            if (options.name) {
                this.name = options.name;
            }
            if (options.orientation) {
                if (DeviceOrientationEvent != 'undefined') {
                    if (typeof (DeviceOrientationEvent.requestPermission) === "function") {
                        var callback = this.initializeOrientation(options.orientation);
                        DeviceOrientationEvent.requestPermission(callback);
                    } else {
                        this.initializeOrientation(options.orientation);
                    }
                }
                else {
                    alert('l\'orientation n\'a pas pu être détectée');
                }
            }
            if (options.acceleration) {
                if (DeviceMotionEvent != 'undefined') {
                    if (typeof (DeviceMotionEvent.requestPermission) === "function") {
                        var callback = this.initializeAcceleration(options.acceleration);
                        DeviceMotionEvent.requestPermission(callback);
                    } else {
                        this.initializeAcceleration(options.acceleration);
                    }
                }
                else {
                    alert('l\'orientation n\'a pas pu être détectée');
                }
            }
        }

        var elements = Array.prototype.slice.call(this.element.children);
        elements.forEach(function (element) {
            var element_options = element.getAttribute('data-zombitron');
            if (element_options) {
                element_options = JSON.parse(element_options);
                if (element_options.type) {
                    var callback = this.send.bind(this);
                    window.zombitron.sensors.initialize(element, element_options, callback);
                }
            }
        }.bind(this));
    },
    initializeSocket: function () {
        try {
            var socketServer = '';
            if (window.location.protocol === 'https:') {
                socketServer = 'wss://';
            } else {
                socketServer = 'ws://';
            }
            socketServer += window.location.host;
            this.socket = new WebSocket(socketServer);
        } catch (e) {
            alert(JSON.stringify(e))
        }

        this.socket.addEventListener('message', function (msg) {
            if (msg) {
                if (msg.data instanceof Blob) {
                    reader = new FileReader();
                    reader.addEventListener('load', function (e) {
                        var object = JSON.parse(reader.result);
                        if (object) {
                            this.onMessage(object);
                        }
                    }.bind(this));
                    reader.readAsText(msg.data);
                }
            }
        }.bind(this));
    },
    onMessage: function (object) {
        Object.keys(object.data).forEach(function (key) {
            var evt = new CustomEvent(key, { detail: object.data[key] });
            window.dispatchEvent(evt);
        }.bind(this));
    },
    initializeOrientation: function (options) {
        this.orientation = new window.zombitron.sensors.Orientation(options);
        window.addEventListener("deviceorientation", function (e) {
            this.onIMUEvent(this.orientation, e, options);
        }.bind(this));
    },
    initializeAcceleration: function (options) {
        this.acceleration = new window.zombitron.sensors.Motion(options);
        window.addEventListener("devicemotion", function (e) {
            this.onIMUEvent(this, acceleration, e, options);
        }.bind(this));
    },
    onIMUEvent: function (imuSensor, e, options) {
        if (imuSensor.newValues(e, options)) {
            this.send(imuSensor);
        }
    },
    send: function (obj) {
        if (this.socket.readyState == 1) {
            var blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
            this.socket.send(blob);
        }
    }
}

window.zombitron.zombiterface5 = zombiterface;